import { z } from "zod";

export const createLandingPageSchema = z.object({
  title: z.string().min(3).max(160),
  slug: z.string().min(3).max(180).regex(/^[a-z0-9-]+$/),
  contentJson: z.record(z.unknown()),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  isPublished: z.boolean().optional(),
});

export const updateLandingPageSchema = createLandingPageSchema.partial();

export type CreateLandingPageInput = z.infer<typeof createLandingPageSchema>;
export type UpdateLandingPageInput = z.infer<typeof updateLandingPageSchema>;
