import { prisma } from "../../config/prisma";

export const wishlistRepository = {
  findByUser(userId: string) {
    return prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
  },
  find(userId: string, productId: string) {
    return prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
  },
  add(userId: string, productId: string) {
    return prisma.wishlistItem.create({ data: { userId, productId } });
  },
  remove(userId: string, productId: string) {
    return prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId } },
    });
  },
};
