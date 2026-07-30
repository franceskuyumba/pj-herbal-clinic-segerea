"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface LandingPageDTO {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
}

export function useAdminLandingPages() {
  const queryClient = useQueryClient();

  const pagesQuery = useQuery({
    queryKey: ["admin", "landing-pages"],
    queryFn: () => apiClient.get<{ success: true; pages: LandingPageDTO[] }>("/landing-pages/admin/all"),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin", "landing-pages"] });
  }

  const create = useMutation({
    mutationFn: (input: { title: string; slug: string; contentJson: Record<string, unknown> }) =>
      apiClient.post("/landing-pages", input),
    onSuccess: invalidate,
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      apiClient.patch(`/landing-pages/${id}`, { isPublished }),
    onSuccess: invalidate,
  });

  return { pages: pagesQuery.data?.pages ?? [], isLoading: pagesQuery.isLoading, create, togglePublish };
}
