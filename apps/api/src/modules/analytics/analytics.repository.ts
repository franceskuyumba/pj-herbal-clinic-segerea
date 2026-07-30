import { prisma } from "../../config/prisma";

export const analyticsRepository = {
  async revenueTotals() {
    const result = await prisma.order.aggregate({
      where: { status: { in: ["paid", "processing", "dispatched", "delivered"] } },
      _sum: { totalCents: true },
      _count: true,
    });
    return { totalRevenueCents: result._sum.totalCents ?? 0, paidOrderCount: result._count };
  },

  async orderCountsByStatus() {
    const rows = await prisma.order.groupBy({ by: ["status"], _count: true });
    return Object.fromEntries(rows.map((r) => [r.status, r._count]));
  },

  async lowStockCount() {
    const rows = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count FROM "Product"
      WHERE stock <= "lowStockThreshold" AND status = 'active'
    `;
    return Number(rows[0]?.count ?? 0);
  },

  async bestSellers(limit: number) {
    const rows = await prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });
    return rows.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      unitsSold: r._sum.quantity ?? 0,
    }));
  },

  async revenueByDay(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    // Raw query: Prisma's query builder can't group by a truncated date column.
    return prisma.$queryRaw<{ day: Date; revenue_cents: bigint }[]>`
      SELECT date_trunc('day', "createdAt") AS day, SUM("totalCents") AS revenue_cents
      FROM "Order"
      WHERE "createdAt" >= ${since} AND status IN ('paid', 'processing', 'dispatched', 'delivered')
      GROUP BY day
      ORDER BY day ASC
    `;
  },
};
