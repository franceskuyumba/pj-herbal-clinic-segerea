import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().min(3).max(40).regex(/^[A-Z0-9-]+$/, "Use uppercase letters, numbers, and dashes only"),
  percentOff: z.number().int().min(1).max(100).optional(),
  amountOffCents: z.number().int().positive().optional(),
  minOrderCents: z.number().int().positive().optional(),
  maxRedemptions: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
}).refine((d) => d.percentOff !== undefined || d.amountOffCents !== undefined, {
  message: "Provide either percentOff or amountOffCents",
});

export const updateCouponSchema = z.object({
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
  maxRedemptions: z.number().int().positive().optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
