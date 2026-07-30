"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ProductDTO } from "@pjherbal/shared-types";

export type ProductInput = Omit<ProductDTO, "id" | "images" | "status"> & {
  imageUrls: string[];
  status?: ProductDTO["status"];
};

export function useAdminProducts(page = 1) {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["admin", "products", page],
    queryFn: () =>
      apiClient.get<{ success: true; items: ProductDTO[]; total: number; pageSize: number }>(
        `/products?page=${page}&pageSize=50`
      ),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  const create = useMutation({
    mutationFn: (input: ProductInput) => apiClient.post("/products", input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, ...input }: Partial<ProductInput> & { id: string }) => apiClient.patch(`/products/${id}`, input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/products/${id}`),
    onSuccess: invalidate,
  });

  return { products: productsQuery.data?.items ?? [], total: productsQuery.data?.total ?? 0, isLoading: productsQuery.isLoading, create, update, remove };
}
