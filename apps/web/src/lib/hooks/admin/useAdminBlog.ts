"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { BlogPostDTO } from "@/lib/hooks/useBlog";

export type BlogPostInput = Omit<BlogPostDTO, "id" | "publishedAt" | "coverImage"> & {
  coverImage?: string;
  isPublished?: boolean;
};

export function useAdminBlogPosts() {
  const queryClient = useQueryClient();

  const postsQuery = useQuery({
    queryKey: ["admin", "blog"],
    queryFn: () => apiClient.get<{ success: true; items: BlogPostDTO[]; total: number }>("/blog/admin/all"),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
    queryClient.invalidateQueries({ queryKey: ["blog"] });
  }

  const create = useMutation({
    mutationFn: (input: BlogPostInput) => apiClient.post("/blog", input),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, ...input }: Partial<BlogPostInput> & { id: string }) => apiClient.patch(`/blog/${id}`, input),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/blog/${id}`),
    onSuccess: invalidate,
  });

  return { posts: postsQuery.data?.items ?? [], isLoading: postsQuery.isLoading, create, update, remove };
}
