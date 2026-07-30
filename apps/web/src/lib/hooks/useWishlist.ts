"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { ProductDTO } from "@pjherbal/shared-types";

export function useWishlist() {
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();

  const wishlistQuery = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => apiClient.get<{ success: true; items: { productId: string; product: ProductDTO }[] }>("/wishlist"),
    enabled: Boolean(firebaseUser),
  });

  const toggle = useMutation({
    mutationFn: async (productId: string) => {
      const isWishlisted = wishlistQuery.data?.items.some((i) => i.productId === productId);
      return isWishlisted
        ? apiClient.delete(`/wishlist/${productId}`)
        : apiClient.post(`/wishlist/${productId}`, {});
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  return { items: wishlistQuery.data?.items ?? [], isLoading: wishlistQuery.isLoading, toggle };
}
