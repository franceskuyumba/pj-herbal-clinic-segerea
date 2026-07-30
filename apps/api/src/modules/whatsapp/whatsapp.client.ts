import axios from "axios";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";

/**
 * Thin wrapper around Meta's WhatsApp Cloud API (graph.facebook.com).
 * Two send modes, matching WhatsApp's own rules:
 *
 *  - sendTemplate: REQUIRED for the first message in a 24-hour window, or
 *    any message to a customer who hasn't messaged us recently — order
 *    confirmations, delivery updates, and cart reminders all use this.
 *    Templates must be pre-approved in the Meta Business dashboard before
 *    they can be sent; the template *names* used below (order_confirmation,
 *    delivery_update, abandoned_cart_reminder) are what you'll register
 *    there — the exact approved copy is up to you, these are just the
 *    variable slots this code fills in.
 *  - sendText: only deliverable within 24 hours of the customer's last
 *    inbound message (WhatsApp's "customer service window") — used for
 *    automated replies to inbound messages, not for outbound-initiated
 *    notifications.
 *
 * Not exercised against a live WhatsApp Business account in this
 * environment (no network access, no real access token) — confirm the
 * exact template component structure against your approved templates in
 * Meta Business Manager before going live.
 */

const GRAPH_VERSION = "v20.0";

function requireConfig() {
  if (!env.WHATSAPP_PHONE_NUMBER_ID || !env.WHATSAPP_ACCESS_TOKEN) {
    throw new AppError("WhatsApp is not configured — set WHATSAPP_* environment variables", 500);
  }
  return { phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID, accessToken: env.WHATSAPP_ACCESS_TOKEN };
}

function normalizePhone(phone: string) {
  // WhatsApp wants E.164 without a leading +, e.g. 255712345678
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `255${digits.slice(1)}`; // Tanzanian local format -> country code
  return digits;
}

export const whatsappClient = {
  async sendTemplate(toPhone: string, templateName: string, bodyParams: string[]) {
    const { phoneNumberId, accessToken } = requireConfig();

    const res = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: normalizePhone(toPhone),
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: bodyParams.length
            ? [{ type: "body", parameters: bodyParams.map((text) => ({ type: "text", text })) }]
            : undefined,
        },
      },
      { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
    );

    return res.data?.messages?.[0]?.id as string | undefined;
  },

  async sendText(toPhone: string, body: string) {
    const { phoneNumberId, accessToken } = requireConfig();

    const res = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: normalizePhone(toPhone),
        type: "text",
        text: { body },
      },
      { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
    );

    return res.data?.messages?.[0]?.id as string | undefined;
  },
};
