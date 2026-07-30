import { z } from "zod";

export const createAddressSchema = z.object({
  label: z.string().max(40).optional(),
  fullName: z.string().min(2).max(120),
  phone: z.string().regex(/^(0|\+255)[67]\d{8}$/, "Enter a valid Tanzanian phone number"),
  region: z.string().min(2),
  district: z.string().min(2),
  streetLine: z.string().min(3),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
