import { prisma } from "../../config/prisma";
import type { CreateReviewInput } from "./review.schema";

export const reviewRepository = {
  findByProduct(productId: string) {
    return prisma.review.findMany({
      where: { productId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
  findByUserAndProduct(userId: string, productId: string) {
    return prisma.review.findUnique({
      where: { productId_userId: { productId, userId } },
    });
  },
  create(userId: string, data: CreateReviewInput) {
    return prisma.review.create({ data: { ...data, userId } });
  },
  delete(id: string) {
    return prisma.review.delete({ where: { id } });
  },
  findById(id: string) {
    return prisma.review.findUnique({ where: { id } });
  },
};
