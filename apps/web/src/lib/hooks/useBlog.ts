"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface BlogPostDTO {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  coverImage: string | null;
  publishedAt: string | null;
}

export function useBlogPosts(page = 1) {
  return useQuery({
    queryKey: ["blog", page],
    queryFn: () => apiClient.get<{ success: true; items: BlogPostDTO[]; total: number; pageSize: number }>(`/blog?page=${page}`),
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: () => apiClient.get<{ success: true; post: BlogPostDTO }>(`/blog/${slug}`),
    enabled: Boolean(slug),
  });
}
