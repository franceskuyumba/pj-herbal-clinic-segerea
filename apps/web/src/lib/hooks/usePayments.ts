"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useInitiatePayment() {
  return useMutation({
    mutationFn: (orderId: string) =>
      apiClient.post<{ success: true; redirectUrl: string }>(`/payments/${orderId}/initiate`, {}),
  });
}

export function useRetryPayment() {
  return useMutation({
    mutationFn: (orderId: string) =>
      apiClient.post<{ success: true; redirectUrl: string }>(`/payments/${orderId}/retry`, {}),
  });
}
