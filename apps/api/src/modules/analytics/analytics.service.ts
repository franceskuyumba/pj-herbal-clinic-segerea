import { analyticsRepository } from "./analytics.repository";

export const analyticsService = {
  async summary() {
    const [revenue, statusCounts, lowStockCount, bestSellers, revenueByDay] = await Promise.all([
      analyticsRepository.revenueTotals(),
      analyticsRepository.orderCountsByStatus(),
      analyticsRepository.lowStockCount(),
      analyticsRepository.bestSellers(5),
      analyticsRepository.revenueByDay(30),
    ]);

    return {
      totalRevenueCents: revenue.totalRevenueCents,
      paidOrderCount: revenue.paidOrderCount,
      ordersByStatus: statusCounts,
      lowStockCount,
      bestSellers,
      revenueByDay: revenueByDay.map((r) => ({
        day: r.day.toISOString().slice(0, 10),
        revenueCents: Number(r.revenue_cents),
      })),
    };
  },
};
