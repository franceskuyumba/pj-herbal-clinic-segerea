import axios from "axios";
import { env } from "../../../config/env";
import { AppError } from "../../../utils/AppError";

/**
 * Flutterwave (used here for bank transfer methods — CRDB, NMB). Flutterwave's
 * Standard/Hosted Payments flow: create a payment link server-side, redirect
 * the customer to it, then verify the transaction status server-side once
 * they return (never trust the client-side redirect alone — always re-verify
 * against Flutterwave's API before marking an order paid).
 *
 * Field names and endpoint paths follow Flutterwave's v3 API docs; not
 * exercised against a live/sandbox account in this environment — confirm
 * against your dashboard before going live.
 */

interface FlutterwavePaymentParams {
  orderId: string;
  amountCents: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
}

function requireConfig() {
  if (!env.FLUTTERWAVE_SECRET_KEY) {
    throw new AppError("Flutterwave is not configured — set FLUTTERWAVE_SECRET_KEY", 500);
  }
  return { secretKey: env.FLUTTERWAVE_SECRET_KEY };
}

const BASE_URL = "https://api.flutterwave.com/v3";

export const flutterwaveProvider = {
  async createCheckout(params: FlutterwavePaymentParams): Promise<{ providerRef: string; redirectUrl: string }> {
    const { secretKey } = requireConfig();

    try {
      const res = await axios.post(
        `${BASE_URL}/payments`,
        {
          tx_ref: params.orderId,
          amount: (params.amountCents / 100).toFixed(2),
          currency: params.currency,
          redirect_url: `${env.APP_URL}/order-success?orderId=${params.orderId}`,
          customer: {
            email: params.customerEmail,
            phonenumber: params.customerPhone,
            name: params.customerName,
          },
          customizations: {
            title: "PJHerbal Clinic",
            description: `Order ${params.orderId}`,
          },
        },
        { headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" } }
      );

      if (res.data?.status !== "success") {
        throw new AppError(`Flutterwave rejected the payment: ${res.data?.message ?? "unknown error"}`, 502);
      }

      return { providerRef: params.orderId, redirectUrl: res.data.data.link };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("Could not reach Flutterwave", 502, err);
    }
  },

  /**
   * Flutterwave webhooks carry a static shared secret in the `verif-hash`
   * header (set in your Flutterwave dashboard, matching
   * FLUTTERWAVE_WEBHOOK_SECRET_HASH) — not an HMAC of the body. A plain
   * equality check IS the documented verification method for this provider.
   */
  verifyWebhookSignature(headers: Record<string, string | string[] | undefined>) {
    const received = headers["verif-hash"];
    return typeof received === "string" && received === env.FLUTTERWAVE_WEBHOOK_SECRET_HASH;
  },

  /**
   * Never trust a webhook's stated status alone — re-fetch the transaction
   * from Flutterwave and confirm amount + currency match what we expected
   * before marking an order paid. This is Flutterwave's own documented
   * recommendation, not extra caution on top of their spec.
   */
  async verifyTransaction(transactionId: string) {
    const { secretKey } = requireConfig();
    const res = await axios.get(`${BASE_URL}/transactions/${transactionId}/verify`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    return res.data?.data as { status: string; amount: number; currency: string; tx_ref: string } | undefined;
  },
};
