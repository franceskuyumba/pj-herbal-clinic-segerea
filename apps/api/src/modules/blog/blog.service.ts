import { blogRepository } from "./blog.repository";
import { AppError } from "../../utils/AppError";
import type { CreatePostInput, ListPostsQuery, UpdatePostInput } from "./blog.schema";

export const blogService = {
  async listPublished(query: ListPostsQuery) {
    const [items, total] = await blogRepository.findPublished(query);
    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async listAllAdmin(query: ListPostsQuery) {
    const [items, total] = await blogRepository.findAllAdmin(query);
    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async getBySlug(slug: string) {
    const post = await blogRepository.findBySlug(slug);
    if (!post || !post.isPublished) throw new AppError("Post not found", 404);
    return post;
  },

  async create(input: CreatePostInput) {
    const existing = await blogRepository.findBySlug(input.slug);
    if (existing) throw new AppError(`Slug "${input.slug}" is already in use`, 409);
    return blogRepository.create(input);
  },

  async update(id: string, input: UpdatePostInput) {
    const existing = await blogRepository.findById(id);
    if (!existing) throw new AppError("Post not found", 404);
    return blogRepository.update(id, input);
  },

  async delete(id: string) {
    const existing = await blogRepository.findById(id);
    if (!existing) throw new AppError("Post not found", 404);
    return blogRepository.delete(id);
  },
};
