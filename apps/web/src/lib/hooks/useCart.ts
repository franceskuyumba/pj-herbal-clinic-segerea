"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { ProductDTO } from "@pjherbal/shared-types";

export interface CartItemDTO {
  id: string;
  productId: string;
  quantity: number;
  product: ProductDTO;
}

export interface CartDTO {
  id: string;
  items: CartItemDTO[];
  couponCode: string | null;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
}

const CART_KEY = ["cart"];

export function useCart() {
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: CART_KEY,
    queryFn: () => apiClient.get<{ success: true; cart: CartDTO }>("/cart"),
    enabled: Boolean(firebaseUser), // cart is always tied to a signed-in user (Phase 2 design)
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: CART_KEY });
  }

  const addItem = useMutation({
    mutationFn: (input: { productId: string; quantity: number }) =>
      apiClient.post<{ success: true; cart: CartDTO }>("/cart/items", input),
    onSuccess: invalidate,
  });

  const updateItem = useMutation({
    mutationFn: (input: { productId: string; quantity: number }) =>
      apiClient.patch<{ success: true; cart: CartDTO }>(`/cart/items/${input.productId}`, {
        quantity: input.quantity,
      }),
    onSuccess: invalidate,
  });

  const removeItem = useMutation({
    mutationFn: (productId: string) => apiClient.delete<{ success: true; cart: CartDTO }>(`/cart/items/${productId}`),
    onSuccess: invalidate,
  });

  const applyCoupon = useMutation({
    mutationFn: (code: string) => apiClient.post<{ success: true; cart: CartDTO }>("/cart/coupon", { code }),
    onSuccess: invalidate,
  });

  const removeCoupon = useMutation({
    mutationFn: () => apiClient.delete<{ success: true; cart: CartDTO }>("/cart/coupon"),
    onSuccess: invalidate,
  });

  return {
    cart: cartQuery.data?.cart,
    isLoading: cartQuery.isLoading,
    addItem,
    updateItem,
    removeItem,
    applyCoupon,
    removeCoupon,
  };
}
