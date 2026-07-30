"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

export interface AddressDTO {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  region: string;
  district: string;
  streetLine: string;
  isDefault: boolean;
}

export type AddressInput = Omit<AddressDTO, "id">;

export function useAddresses() {
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: () => apiClient.get<{ success: true; addresses: AddressDTO[] }>("/addresses"),
    enabled: Boolean(firebaseUser),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["addresses"] });
  }

  const addAddress = useMutation({
    mutationFn: (input: AddressInput) => apiClient.post("/addresses", input),
    onSuccess: invalidate,
  });

  const removeAddress = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/addresses/${id}`),
    onSuccess: invalidate,
  });

  return { addresses: addressesQuery.data?.addresses ?? [], isLoading: addressesQuery.isLoading, addAddress, removeAddress };
}
