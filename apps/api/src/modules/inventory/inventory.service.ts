import { prisma } from "../../config/prisma";
import { inventoryRepository } from "./inventory.repository";
import { productRepository } from "../products/product.repository";
import { AppError } from "../../utils/AppError";
import type { AdjustStockInput, CreateBatchInput } from "./inventory.schema";

export const inventoryService = {
  lowStock() {
    return inventoryRepository.lowStockProducts();
  },

  history(productId: string) {
    return inventoryRepository.logsForProduct(productId);
  },

  /**
   * Manual stock correction (restock, damage write-off, recount).
   * Every automatic decrement from a sale goes through
   * productService.reserveStock instead — this endpoint is for admin use.
   */
  async adjustStock(productId: string, input: AdjustStockInput) {
    const product = await productRepository.findById(productId);
    if (!product) throw new AppError("Product not found", 404);

    const newStock = product.stock + input.change;
    if (newStock < 0) {
      throw new AppError(`Adjustment would take stock below zero (current: ${product.stock})`, 409);
    }

    return prisma.$transaction([
      prisma.product.update({ where: { id: productId }, data: { stock: newStock } }),
      prisma.inventoryLog.create({
        data: { productId, change: input.change, reason: input.reason },
      }),
    ]);
  },

  async receiveBatch(input: CreateBatchInput) {
    const product = await productRepository.findById(input.productId);
    if (!product) throw new AppError("Product not found", 404);

    return prisma.$transaction([
      prisma.productBatch.create({
        data: {
          ...input,
          manufacturedAt: input.manufacturedAt ? new Date(input.manufacturedAt) : undefined,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        },
      }),
      prisma.product.update({
        where: { id: input.productId },
        data: { stock: { increment: input.quantity } },
      }),
      prisma.inventoryLog.create({
        data: { productId: input.productId, change: input.quantity, reason: `batch_received:${input.batchCode}` },
      }),
    ]);
  },

  batches(productId: string) {
    return inventoryRepository.batchesForProduct(productId);
  },
};
