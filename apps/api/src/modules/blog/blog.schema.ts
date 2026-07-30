import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(3).max(160),
  slug: z.string().min(3).max(180).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(10).max(300),
  contentHtml: z.string().min(20),
  coverImage: z.string().url().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  isPublished: z.boolean().optional(),
});

export const updatePostSchema = createPostSchema.partial();

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
