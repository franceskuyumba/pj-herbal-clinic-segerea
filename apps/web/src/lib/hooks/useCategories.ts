"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.get<{ success: true; categories: CategoryDTO[] }>("/categories"),
    staleTime: 5 * 60_000, // categories change rarely
  });
}
