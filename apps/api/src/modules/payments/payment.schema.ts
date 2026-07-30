import { z } from "zod";

export const initiatePaymentParamsSchema = z.object({
  orderId: z.string().cuid(),
});

// Selcom's webhook posts the fields it signs as flat form/JSON values —
// exact field set confirmed against your Selcom merchant docs before go-live.
export const selcomWebhookSchema = z.object({
  order_id: z.string(),
  payment_status: z.string(), // e.g. "COMPLETED", "FAILED", "PENDING"
  transid: z.string().optional(),
  amount: z.string().optional(),
  currency: z.string().optional(),
});

export const flutterwaveWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    id: z.number(),
    tx_ref: z.string(),
    status: z.string(),
    amount: z.number(),
    currency: z.string(),
  }),
});

export type SelcomWebhookPayload = z.infer<typeof selcomWebhookSchema>;
export type FlutterwaveWebhookPayload = z.infer<typeof flutterwaveWebhookSchema>;
