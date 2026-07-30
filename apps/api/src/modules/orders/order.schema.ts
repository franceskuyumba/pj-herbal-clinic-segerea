import { z } from "zod";

const contactFields = {
  fullName: z.string().min(2).max(120),
  phone: z.string().regex(/^(0|\+255)[67]\d{8}$/, "Enter a valid Tanzanian phone number"),
  email: z.string().email(),
  region: z.string().min(2),
  district: z.string().min(2),
  streetLine: z.string().min(3),
};

export const checkoutSchema = z.object({
  ...contactFields,
  paymentProvider: z.enum(["selcom", "flutterwave", "dpo"]),
  paymentMethod: z.enum(["mpesa", "tigopesa", "airtelmoney", "halopesa", "crdb_bank", "nmb_bank"]),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "processing", "dispatched", "delivered", "cancelled"]),
});

export const listOrdersQuerySchema = z.object({
  status: z.enum(["pending", "paid", "processing", "dispatched", "delivered", "cancelled"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
