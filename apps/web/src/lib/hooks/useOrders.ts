"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { OrderDTO } from "@pjherbal/shared-types";

export interface CheckoutInput {
  fullName: string;
  phone: string;
  email: string;
  region: string;
  district: string;
  streetLine: string;
  paymentProvider: "selcom" | "flutterwave" | "dpo";
  paymentMethod: "mpesa" | "tigopesa" | "airtelmoney" | "halopesa" | "crdb_bank" | "nmb_bank";
}

export function useMyOrders() {
  const { firebaseUser } = useAuth();
  return useQuery({
    queryKey: ["orders", "mine"],
    queryFn: () => apiClient.get<{ success: true; items: OrderDTO[]; total: number }>("/orders/mine"),
    enabled: Boolean(firebaseUser),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => apiClient.get<{ success: true; order: OrderDTO }>(`/orders/${id}`),
    enabled: Boolean(id),
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CheckoutInput) =>
      apiClient.post<{ success: true; order: OrderDTO }>("/orders/checkout", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
