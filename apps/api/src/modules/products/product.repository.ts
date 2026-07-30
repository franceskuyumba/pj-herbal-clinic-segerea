import { prisma } from "../../config/prisma";
import type { CreateProductInput, UpdateProductInput } from "./product.schema";

const includeStandard = { images: true, category: true } as const;

/**
 * Repository layer: the ONLY place in the products module that talks to
 * Prisma directly. Services depend on this interface, not on Prisma —
 * that's what keeps the business logic testable and swappable.
 */
export const productRepository = {
  async findMany(params: { q?: string; categoryId?: string; page: number; pageSize: number }) {
    const { q, categoryId, page, pageSize } = params;

    const where = {
      ...(categoryId ? { categoryId } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: includeStandard,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total, page, pageSize };
  },

  findBySlug(slug: string) {
    return prisma.product.findUnique({ where: { slug }, include: includeStandard });
  },

  findById(id: string) {
    return prisma.product.findUnique({ where: { id }, include: includeStandard });
  },

  create(data: CreateProductInput) {
    const { imageUrls, ...rest } = data;
    return prisma.product.create({
      data: {
        ...rest,
        images: { create: imageUrls.map((url, position) => ({ url, position })) },
      },
      include: includeStandard,
    });
  },

  update(id: string, data: UpdateProductInput) {
    const { imageUrls, ...rest } = data;
    return prisma.product.update({
      where: { id },
      data: {
        ...rest,
        // Replacing the image set entirely is simpler and safer than a
        // partial diff for a small product catalog — admin re-uploads the
        // full set on edit rather than patching individual images.
        ...(imageUrls ? { images: { deleteMany: {}, create: imageUrls.map((url, position) => ({ url, position })) } } : {}),
      },
      include: includeStandard,
    });
  },

  delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },

  decrementStock(id: string, quantity: number) {
    return prisma.product.update({
      where: { id },
      data: { stock: { decrement: quantity } },
    });
  },
};
