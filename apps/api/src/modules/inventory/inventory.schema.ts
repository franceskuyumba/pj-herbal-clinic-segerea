import { z } from "zod";

export const adjustStockSchema = z.object({
  change: z.number().int().refine((n) => n !== 0, "change must not be zero"),
  reason: z.string().min(3).max(200),
});

export const createBatchSchema = z.object({
  productId: z.string().cuid(),
  batchCode: z.string().min(1).max(60),
  quantity: z.number().int().positive(),
  manufacturedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type CreateBatchInput = z.infer<typeof createBatchSchema>;
