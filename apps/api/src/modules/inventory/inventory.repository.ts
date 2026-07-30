import { prisma } from "../../config/prisma";
import type { CreateBatchInput } from "./inventory.schema";

export const inventoryRepository = {
  lowStockProducts() {
    // Postgres can't compare two columns of the same row with a simple
    // Prisma `where`, so this is a raw query against the indexed columns.
    return prisma.$queryRaw`
      SELECT id, name, stock, "lowStockThreshold"
      FROM "Product"
      WHERE stock <= "lowStockThreshold" AND status = 'active'
      ORDER BY stock ASC
    `;
  },

  logsForProduct(productId: string) {
    return prisma.inventoryLog.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  },

  batchesForProduct(productId: string) {
    return prisma.productBatch.findMany({
      where: { productId },
      orderBy: { receivedAt: "desc" },
    });
  },

  createBatch(data: CreateBatchInput) {
    return prisma.productBatch.create({
      data: {
        ...data,
        manufacturedAt: data.manufacturedAt ? new Date(data.manufacturedAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
  },
};
