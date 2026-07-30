"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface CourierDTO {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
}

export function useCouriers() {
  const queryClient = useQueryClient();

  const couriersQuery = useQuery({
    queryKey: ["admin", "couriers"],
    queryFn: () => apiClient.get<{ success: true; couriers: CourierDTO[] }>("/delivery/couriers"),
  });

  const addCourier = useMutation({
    mutationFn: (input: { name: string; phone: string }) => apiClient.post("/delivery/couriers", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "couriers"] }),
  });

  return { couriers: couriersQuery.data?.couriers ?? [], isLoading: couriersQuery.isLoading, addCourier };
}

export function useAssignDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, courierId }: { orderId: string; courierId: string }) =>
      apiClient.post(`/delivery/${orderId}/assign`, { courierId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });
}
