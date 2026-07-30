"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface ReviewDTO {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string | null };
}

export function useReviews(productId: string | undefined) {
  const queryClient = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => apiClient.get<{ success: true; reviews: ReviewDTO[] }>(`/reviews/product/${productId}`),
    enabled: Boolean(productId),
  });

  const addReview = useMutation({
    mutationFn: (input: { productId: string; rating: number; comment?: string }) =>
      apiClient.post("/reviews", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews", productId] }),
  });

  return { reviews: reviewsQuery.data?.reviews ?? [], isLoading: reviewsQuery.isLoading, addReview };
}
