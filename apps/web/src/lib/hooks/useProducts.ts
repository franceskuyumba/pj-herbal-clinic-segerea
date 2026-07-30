"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ProductDTO } from "@pjherbal/shared-types";

interface ProductListResponse {
  success: true;
  items: ProductDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export function useProducts(params: { q?: string; category?: string; page?: number } = {}) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.page) search.set("page", String(params.page));

  return useQuery({
    queryKey: ["products", params],
    queryFn: () => apiClient.get<ProductListResponse>(`/products?${search.toString()}`),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => apiClient.get<{ success: true; product: ProductDTO }>(`/products/${slug}`),
    enabled: Boolean(slug),
  });
}
