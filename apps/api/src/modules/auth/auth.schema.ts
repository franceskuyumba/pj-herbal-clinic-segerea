import { z } from "zod";

export const updateMeSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().regex(/^(0|\+255)[67]\d{8}$/, "Enter a valid Tanzanian phone number").optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["customer", "staff", "admin"]),
  permissions: z.array(z.string()).optional(),
});

export const listUsersQuerySchema = z.object({
  role: z.enum(["customer", "staff", "admin"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
