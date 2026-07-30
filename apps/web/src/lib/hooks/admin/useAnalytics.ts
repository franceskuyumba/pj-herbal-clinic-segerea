"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface AnalyticsSummary {
  totalRevenueCents: number;
  paidOrderCount: number;
  ordersByStatus: Record<string, number>;
  lowStockCount: number;
  bestSellers: { productId: string; productName: string; unitsSold: number }[];
  revenueByDay: { day: string; revenueCents: number }[];
}

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["admin", "analytics", "summary"],
    queryFn: () => apiClient.get<{ success: true } & AnalyticsSummary>("/analytics/summary"),
  });
}
