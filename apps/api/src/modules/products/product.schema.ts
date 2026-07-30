import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).regex(/^[a-z0-9-]+$/, "slug must be lowercase-kebab-case"),
  shortBenefits: z.string().min(3).max(200),
  description: z.string().min(10),
  ingredients: z.string().min(3),
  usageInstructions: z.string().min(3),
  benefits: z.string().min(3),
  warnings: z.string().min(3),
  categoryId: z.string().cuid(),
  priceCents: z.number().int().positive(),
  compareAtCents: z.number().int().positive().optional(),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).optional(),
  imageUrls: z.array(z.string().url()).min(1).max(8),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(), // category SLUG, resolved to categoryId in the service
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
