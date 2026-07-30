"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { OrderDTO, OrderStatus } from "@pjherbal/shared-types";

export function useAdminOrders(status?: OrderStatus) {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["admin", "orders", status],
    queryFn: () =>
      apiClient.get<{ success: true; items: OrderDTO[]; total: number }>(
        `/orders${status ? `?status=${status}` : ""}`
      ),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      apiClient.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });

  return { orders: ordersQuery.data?.items ?? [], isLoading: ordersQuery.isLoading, updateStatus };
}
