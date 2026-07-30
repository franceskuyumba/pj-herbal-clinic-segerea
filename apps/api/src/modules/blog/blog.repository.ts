import { prisma } from "../../config/prisma";
import type { CreatePostInput, ListPostsQuery, UpdatePostInput } from "./blog.schema";

export const blogRepository = {
  findPublished(query: ListPostsQuery) {
    const where = { isPublished: true };
    return Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.blogPost.count({ where }),
    ]);
  },
  findAllAdmin(query: ListPostsQuery) {
    return Promise.all([
      prisma.blogPost.findMany({
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.blogPost.count(),
    ]);
  },
  findBySlug(slug: string) {
    return prisma.blogPost.findUnique({ where: { slug } });
  },
  findById(id: string) {
    return prisma.blogPost.findUnique({ where: { id } });
  },
  create(data: CreatePostInput) {
    return prisma.blogPost.create({
      data: { ...data, publishedAt: data.isPublished ? new Date() : undefined },
    });
  },
  update(id: string, data: UpdatePostInput) {
    return prisma.blogPost.update({
      where: { id },
      data: { ...data, publishedAt: data.isPublished ? new Date() : undefined },
    });
  },
  delete(id: string) {
    return prisma.blogPost.delete({ where: { id } });
  },
};
