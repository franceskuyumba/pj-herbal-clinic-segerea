import axios from "axios";
import crypto from "node:crypto";
import { env } from "../../../config/env";
import { AppError } from "../../../utils/AppError";

/**
 * Selcom Pay (Tanzania mobile money aggregator — M-Pesa, Tigo Pesa, Airtel
 * Money, HaloPesa all route through here). Selcom's API authenticates
 * requests with a signed digest built from the request headers/body using
 * HMAC-SHA256 with the API key/secret, per their published gateway spec.
 *
 * IMPORTANT: this follows Selcom's documented request/response SHAPE as
 * closely as published documentation allows, but has not been exercised
 * against Selcom's live or sandbox environment (no network access in this
 * environment, and no real merchant credentials exist yet). Confirm field
 * names and the exact digest recipe against your Selcom merchant dashboard
 * / API docs before going live, using their sandbox first.
 */

interface SelcomOrderParams {
  orderId: string;
  amountCents: number;
  currency: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
}

function requireConfig() {
  if (!env.SELCOM_API_KEY || !env.SELCOM_API_SECRET || !env.SELCOM_VENDOR_ID || !env.SELCOM_BASE_URL) {
    throw new AppError("Selcom is not configured — set SELCOM_* environment variables", 500);
  }
  return {
    apiKey: env.SELCOM_API_KEY,
    apiSecret: env.SELCOM_API_SECRET,
    vendorId: env.SELCOM_VENDOR_ID,
    baseUrl: env.SELCOM_BASE_URL,
  };
}

/** Selcom signs requests as: base64(HMAC-SHA256(signedFieldsString, apiSecret)), with a matching "signed_fields_names" header. */
function sign(payload: Record<string, string>, apiSecret: string) {
  const fieldNames = Object.keys(payload);
  const signedString = fieldNames.map((k) => `${k}=${payload[k]}`).join("&");
  const signature = crypto.createHmac("sha256", apiSecret).update(signedString).digest("base64");
  return { signature, signedFieldsNames: fieldNames.join(",") };
}

export const selcomProvider = {
  async createCheckout(params: SelcomOrderParams): Promise<{ providerRef: string; redirectUrl: string }> {
    const { apiKey, apiSecret, vendorId, baseUrl } = requireConfig();

    const timestamp = new Date().toISOString();
    const payload = {
      vendor: vendorId,
      order_id: params.orderId,
      buyer_email: params.buyerEmail,
      buyer_name: params.buyerName,
      buyer_phone: params.buyerPhone,
      amount: String(Math.round(params.amountCents / 100)),
      currency: params.currency,
      no_of_items: "1",
      redirect_url: `${env.APP_URL}/order-success?orderId=${params.orderId}`,
      cancel_url: `${env.APP_URL}/checkout`,
      webhook: `${env.API_URL}/api/v1/payments/webhook/selcom`,
    };
    const { signature, signedFieldsNames } = sign(payload, apiSecret);

    try {
      const res = await axios.post(`${baseUrl}/checkout/create-order-minimal`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `SELCOM ${Buffer.from(apiKey).toString("base64")}`,
          "Digest-Method": "HS256",
          Digest: signature,
          Timestamp: timestamp,
          "Signed-Fields": signedFieldsNames,
        },
      });

      if (res.data?.result !== "SUCCESS") {
        throw new AppError(`Selcom rejected the order: ${res.data?.message ?? "unknown error"}`, 502);
      }

      return {
        providerRef: res.data.data?.[0]?.order_id ?? params.orderId,
        redirectUrl: res.data.data?.[0]?.payment_gateway_url,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("Could not reach Selcom", 502, err);
    }
  },

  /**
   * Selcom webhook payloads are signed the same way as outgoing requests —
   * verify the Digest header against the raw body before trusting a status
   * update. Rejecting an unverifiable webhook is the safe default.
   */
  verifyWebhookSignature(headers: Record<string, string | string[] | undefined>, rawBody: Record<string, string>) {
    const { apiSecret } = requireConfig();
    const receivedDigest = headers["digest"];
    if (!receivedDigest || typeof receivedDigest !== "string") return false;
    const { signature } = sign(rawBody, apiSecret);
    // Constant-time comparison — signature checks must never be a plain === on secret-derived values.
    const a = Buffer.from(signature);
    const b = Buffer.from(receivedDigest);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  },
};
