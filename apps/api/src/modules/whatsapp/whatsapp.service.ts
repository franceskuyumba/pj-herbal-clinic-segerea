import { whatsappClient } from "./whatsapp.client";
import { whatsappRepository } from "./whatsapp.repository";
import { formatMoney } from "../../utils/formatMoney";
import type { Order, OrderItem } from "@prisma/client";

/**
 * Every send in this service follows the same shape: try the real WhatsApp
 * API call, log the outcome either way (success or failure), and NEVER let
 * a WhatsApp failure break the calling flow (a checkout or payment webhook
 * must succeed even if the notification message fails to send) — so every
 * public method here swallows its own errors after logging them.
 */
export const whatsappService = {
  async sendOrderConfirmation(order: Order & { items: OrderItem[] }) {
    const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ");
    try {
      await whatsappClient.sendTemplate(order.phone, "order_confirmation", [
        order.fullName,
        order.orderNumber,
        itemsSummary,
        formatMoney(order.totalCents, "TZS"),
      ]);
      await whatsappRepository.logMessage(order.phone, "order_confirmation", "sent", order.id);
    } catch (err) {
      await whatsappRepository.logMessage(order.phone, "order_confirmation", "failed", order.id, {
        error: String(err),
      });
    }
  },

  async sendPaymentConfirmed(order: Order) {
    try {
      await whatsappClient.sendTemplate(order.phone, "payment_confirmed", [order.orderNumber]);
      await whatsappRepository.logMessage(order.phone, "payment_confirmed", "sent", order.id);
    } catch (err) {
      await whatsappRepository.logMessage(order.phone, "payment_confirmed", "failed", order.id, { error: String(err) });
    }
  },

  async sendDeliveryUpdate(order: Order, status: string) {
    try {
      await whatsappClient.sendTemplate(order.phone, "delivery_update", [order.orderNumber, status]);
      await whatsappRepository.logMessage(order.phone, "delivery_update", "sent", order.id, { status });
    } catch (err) {
      await whatsappRepository.logMessage(order.phone, "delivery_update", "failed", order.id, { error: String(err) });
    }
  },

  /**
   * Entry point for the cron job (registered in server.ts). Finds carts
   * that have gone quiet and haven't been reminded, sends one reminder
   * each, and marks them so the same cart is never reminded twice — even
   * if the job runs again before the customer acts.
   */
  async sendAbandonedCartReminders(staleMinutes = 120) {
    const carts = await whatsappRepository.findAbandonedCarts(staleMinutes);
    let sent = 0;

    for (const cart of carts) {
      if (!cart.user.phone) continue; // nothing to send to — skip, don't fail the batch
      const itemNames = cart.items.map((i) => i.product.name).slice(0, 3).join(", ");

      try {
        await whatsappClient.sendTemplate(cart.user.phone, "abandoned_cart_reminder", [
          cart.user.name ?? "there",
          itemNames,
        ]);
        await whatsappRepository.logMessage(cart.user.phone, "abandoned_cart_reminder", "sent");
        sent += 1;
      } catch (err) {
        await whatsappRepository.logMessage(cart.user.phone, "abandoned_cart_reminder", "failed", undefined, {
          error: String(err),
        });
      } finally {
        // Mark as reminded regardless of send success — a failed send
        // shouldn't retry every cron tick forever; the admin can see
        // failures in WhatsAppMessage logs and follow up manually.
        await whatsappRepository.markReminderSent(cart.id);
      }
    }

    return { scanned: carts.length, sent };
  },

  /**
   * Broadcasts a promo campaign to every customer with a phone on file.
   * Sequential with a small delay between sends — the Cloud API has its
   * own rate limits, and a large customer list needs a real queue (e.g.
   * BullMQ) rather than a tight loop; this is fine for the campaign sizes
   * a single-branch shop like this will actually run, but flagged here as
   * the thing to revisit if the customer list grows into the thousands.
   */
  async dispatchCampaign(message: string) {
    const recipients = await whatsappRepository.findBroadcastablePhones();
    let sent = 0;

    for (const recipient of recipients) {
      if (!recipient.phone) continue;
      try {
        await whatsappClient.sendText(recipient.phone, message);
        await whatsappRepository.logMessage(recipient.phone, "campaign_broadcast", "sent");
        sent += 1;
      } catch (err) {
        await whatsappRepository.logMessage(recipient.phone, "campaign_broadcast", "failed", undefined, {
          error: String(err),
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 250)); // gentle pacing against rate limits
    }

    return { targeted: recipients.length, sent };
  },

  /**
   * Automated response to an inbound customer message (SRS "Automated
   * responses" / "Customer support automation"). Deliberately simple —
   * a real support bot is out of scope here — this just acknowledges the
   * message and points the customer to a human, rather than leaving them
   * with no response at all outside business hours.
   */
  async handleInboundMessage(fromPhone: string, _text: string) {
    const reply =
      "Thanks for messaging PJHerbal Clinic! A specialist will reply shortly. " +
      "For urgent questions, call us at +255 000 000 000.";
    try {
      await whatsappClient.sendText(fromPhone, reply);
      await whatsappRepository.logMessage(fromPhone, "auto_reply", "sent");
    } catch (err) {
      await whatsappRepository.logMessage(fromPhone, "auto_reply", "failed", undefined, { error: String(err) });
    }
  },
};
