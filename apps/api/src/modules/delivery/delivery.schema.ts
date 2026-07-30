import { z } from "zod";

export const assignCourierSchema = z.object({
  courierId: z.string().cuid(),
  estimatedAt: z.string().datetime().optional(),
});

export const updateDeliveryStatusSchema = z.object({
  status: z.enum(["unassigned", "assigned", "picked_up", "in_transit", "delivered", "failed"]),
});

export const createCourierSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().regex(/^(0|\+255)[67]\d{8}$/),
});

export type AssignCourierInput = z.infer<typeof assignCourierSchema>;
export type UpdateDeliveryStatusInput = z.infer<typeof updateDeliveryStatusSchema>;
export type CreateCourierInput = z.infer<typeof createCourierSchema>;
