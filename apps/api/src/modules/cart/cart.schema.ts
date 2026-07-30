import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(50),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(50),
});

export const applyCouponSchema = z.object({
  code: z.string().min(2).max(40),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
