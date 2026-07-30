import { prisma } from "../../config/prisma";
import type { Prisma } from "@prisma/client";

export const paymentRepository = {
  findByOrderId(orderId: string) {
    return prisma.payment.findUnique({ where: { orderId }, include: { order: true } });
  },

  findByProviderRef(providerRef: string) {
    return prisma.payment.findFirst({ where: { providerRef } });
  },

  updateStatus(id: string, status: string, providerRef?: string) {
    return prisma.payment.update({
      where: { id },
      data: { status: status as never, ...(providerRef ? { providerRef } : {}) },
    });
  },

  incrementRetry(id: string) {
    return prisma.payment.update({ where: { id }, data: { retryCount: { increment: 1 } } });
  },

  addLog(paymentId: string, event: string, rawPayload?: Prisma.InputJsonValue) {
    return prisma.paymentLog.create({ data: { paymentId, event, rawPayload } });
  },

  /**
   * Payment confirmation crosses into Order — same documented exception as
   * checkout in the orders module (Phase 3): this is a genuinely
   * cross-aggregate write (Payment + Order together), done in one
   * transaction rather than threaded through two repositories.
   */
  markOrderPaid(orderId: string) {
    // updateMany (not update) because the where-clause needs a
    // non-unique filter (status) alongside id — and because a 0-row
    // result is exactly the expected outcome for a duplicate webhook on
    // an order that's already past "pending", not an error to catch.
    return prisma.order.updateMany({
      where: { id: orderId, status: "pending" },
      data: { status: "paid" },
    });
  },
};
