"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface CouponDTO {
  code: string;
  percentOff: number | null;
  amountOffCents: number | null;
  minOrderCents: number | null;
  maxRedemptions: number | null;
  redeemedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

export function useAdminCoupons() {
  const queryClient = useQueryClient();

  const couponsQuery = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: () => apiClient.get<{ success: true; coupons: CouponDTO[] }>("/coupons"),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
  }

  const create = useMutation({
    mutationFn: (input: { code: string; percentOff?: number; amountOffCents?: number; expiresAt?: string }) =>
      apiClient.post("/coupons", input),
    onSuccess: invalidate,
  });

  const setActive = useMutation({
    mutationFn: ({ code, isActive }: { code: string; isActive: boolean }) =>
      apiClient.patch(`/coupons/${code}`, { isActive }),
    onSuccess: invalidate,
  });

  return { coupons: couponsQuery.data?.coupons ?? [], isLoading: couponsQuery.isLoading, create, setActive };
}
