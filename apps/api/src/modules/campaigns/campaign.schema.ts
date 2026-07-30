import { z } from "zod";

export const createCampaignSchema = z.object({
  name: z.string().min(2).max(120),
  channel: z.enum(["email", "whatsapp"]),
  message: z.string().min(5).max(2000),
  scheduledFor: z.string().datetime().optional(),
});

export const updateCampaignStatusSchema = z.object({
  status: z.enum(["draft", "scheduled", "sent", "cancelled"]),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignStatusInput = z.infer<typeof updateCampaignStatusSchema>;
