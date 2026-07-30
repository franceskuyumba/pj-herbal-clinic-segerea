import { paymentRepository } from "./payment.repository";
import { selcomProvider } from "./providers/selcom";
import { flutterwaveProvider } from "./providers/flutterwave";
import { dpoProvider } from "./providers/dpo";
import { whatsappService } from "../whatsapp/whatsapp.service";
import { AppError } from "../../utils/AppError";
import type { FlutterwaveWebhookPayload, SelcomWebhookPayload } from "./payment.schema";

const MAX_RETRIES = 3;

export const paymentService = {
  /**
   * Called right after checkout (or again on retry) to actually hand the
   * customer off to their chosen payment provider. Idempotent in the sense
   * that calling it again on an "initiated" payment just re-issues a fresh
   * checkout link — it does not create a second Payment row (checkout
   * already created exactly one, 1:1 with the order).
   */
  async initiate(orderId: string, requestingUserId: string) {
    const payment = await paymentRepository.findByOrderId(orderId);
    if (!payment) throw new AppError("No payment record for this order", 404);
    if (payment.order.userId !== requestingUserId) throw new AppError("Not your order", 403);
    if (payment.status === "successful") throw new AppError("This order is already paid", 409);

    const order = payment.order;
    const [firstName, ...lastNameParts] = order.fullName.split(" ");

    let result: { providerRef: string; redirectUrl: string };
    switch (payment.provider) {
      case "selcom":
        result = await selcomProvider.createCheckout({
          orderId: order.id,
          amountCents: payment.amountCents,
          currency: payment.currency,
          buyerName: order.fullName,
          buyerPhone: order.phone,
          buyerEmail: order.email,
        });
        break;
      case "flutterwave":
        result = await flutterwaveProvider.createCheckout({
          orderId: order.id,
          amountCents: payment.amountCents,
          currency: payment.currency,
          customerEmail: order.email,
          customerName: order.fullName,
          customerPhone: order.phone,
        });
        break;
      case "dpo":
        result = await dpoProvider.createCheckout({
          orderId: order.id,
          amountCents: payment.amountCents,
          currency: payment.currency,
          customerEmail: order.email,
          customerFirstName: firstName ?? order.fullName,
          customerLastName: lastNameParts.join(" ") || "Customer",
        });
        break;
      default:
        throw new AppError(`Unsupported payment provider: ${payment.provider}`, 400);
    }

    await paymentRepository.updateStatus(payment.id, "pending", result.providerRef);
    await paymentRepository.addLog(payment.id, "provider_initiated", { provider: payment.provider, providerRef: result.providerRef });

    return { redirectUrl: result.redirectUrl };
  },

  async retry(orderId: string, requestingUserId: string) {
    const payment = await paymentRepository.findByOrderId(orderId);
    if (!payment) throw new AppError("No payment record for this order", 404);
    if (payment.order.userId !== requestingUserId) throw new AppError("Not your order", 403);
    if (payment.status === "successful") throw new AppError("This order is already paid", 409);
    if (payment.retryCount >= MAX_RETRIES) {
      throw new AppError("Maximum payment retry attempts reached — please contact support", 429);
    }

    await paymentRepository.incrementRetry(payment.id);
    await paymentRepository.addLog(payment.id, "retry_requested");
    return this.initiate(orderId, requestingUserId);
  },

  /**
   * Selcom webhook handler. Verifies the digest signature against the raw
   * payload before trusting anything in it — an unverifiable webhook is
   * logged and rejected, never silently accepted.
   */
  async handleSelcomWebhook(payload: SelcomWebhookPayload, headers: Record<string, string | string[] | undefined>) {
    const verified = selcomProvider.verifyWebhookSignature(headers, payload as unknown as Record<string, string>);
    if (!verified) throw new AppError("Invalid webhook signature", 401);

    const payment = await paymentRepository.findByProviderRef(payload.order_id);
    if (!payment) throw new AppError("No matching payment for this webhook", 404);

    await paymentRepository.addLog(payment.id, "webhook_received", payload as unknown as Record<string, string>);

    if (payment.status === "successful") return { alreadyProcessed: true }; // idempotent against duplicate webhook delivery

    const succeeded = payload.payment_status === "COMPLETED";
    await paymentRepository.updateStatus(payment.id, succeeded ? "successful" : "failed");
    if (succeeded) {
      await paymentRepository.markOrderPaid(payment.orderId);
      await whatsappService.sendPaymentConfirmed(payment.order);
    }

    return { alreadyProcessed: false, succeeded };
  },

  /**
   * Flutterwave webhook handler. The header check (verif-hash) proves the
   * request came from Flutterwave; the transaction is still re-verified
   * against Flutterwave's API before trusting the amount, per their own
   * documented recommendation — a webhook claiming success is a signal to
   * go check, not proof on its own.
   */
  async handleFlutterwaveWebhook(
    payload: FlutterwaveWebhookPayload,
    headers: Record<string, string | string[] | undefined>
  ) {
    if (!flutterwaveProvider.verifyWebhookSignature(headers)) {
      throw new AppError("Invalid webhook signature", 401);
    }

    const payment = await paymentRepository.findByProviderRef(payload.data.tx_ref);
    if (!payment) throw new AppError("No matching payment for this webhook", 404);

    await paymentRepository.addLog(payment.id, "webhook_received", payload as unknown as Record<string, unknown>);

    if (payment.status === "successful") return { alreadyProcessed: true };

    const verification = await flutterwaveProvider.verifyTransaction(String(payload.data.id));
    const succeeded =
      verification?.status === "successful" &&
      Math.round(verification.amount * 100) === payment.amountCents &&
      verification.currency === payment.currency;

    await paymentRepository.updateStatus(payment.id, succeeded ? "successful" : "failed");
    if (succeeded) {
      await paymentRepository.markOrderPaid(payment.orderId);
      await whatsappService.sendPaymentConfirmed(payment.order);
    }

    return { alreadyProcessed: false, succeeded };
  },

  /**
   * DPO has no push-webhook signing scheme to verify — this endpoint is
   * called when the customer is redirected back from DPO's hosted page,
   * and actively polls verifyToken using OUR stored providerRef as the
   * source of truth, rather than trusting anything in the query string
   * DPO redirected the customer with.
   */
  async confirmDpoPayment(orderId: string, requestingUserId: string) {
    const payment = await paymentRepository.findByOrderId(orderId);
    if (!payment) throw new AppError("No payment record for this order", 404);
    if (payment.order.userId !== requestingUserId) throw new AppError("Not your order", 403);
    if (!payment.providerRef) throw new AppError("Payment was never initiated with DPO", 409);

    if (payment.status === "successful") return { succeeded: true };

    const result = await dpoProvider.verifyToken(payment.providerRef);
    await paymentRepository.addLog(payment.id, "dpo_verify_polled", result.raw);

    await paymentRepository.updateStatus(payment.id, result.approved ? "successful" : "failed");
    if (result.approved) {
      await paymentRepository.markOrderPaid(payment.orderId);
      await whatsappService.sendPaymentConfirmed(payment.order);
    }

    return { succeeded: result.approved };
  },
};
