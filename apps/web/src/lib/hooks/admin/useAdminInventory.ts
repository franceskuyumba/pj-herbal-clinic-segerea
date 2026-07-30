"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  lowStockThreshold: number;
}

export function useLowStock() {
  return useQuery({
    queryKey: ["admin", "inventory", "low-stock"],
    queryFn: () => apiClient.get<{ success: true; products: LowStockProduct[] }>("/inventory/low-stock"),
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, change, reason }: { productId: string; change: number; reason: string }) =>
      apiClient.post(`/inventory/${productId}/adjust`, { change, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
