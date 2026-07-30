import { reviewRepository } from "./review.repository";
import { AppError } from "../../utils/AppError";
import type { CreateReviewInput } from "./review.schema";

export const reviewService = {
  listForProduct(productId: string) {
    return reviewRepository.findByProduct(productId);
  },

  async create(userId: string, input: CreateReviewInput) {
    // One review per customer per product — enforced here for a clear
    // error message, and again at the DB level (@@unique) as the backstop.
    const existing = await reviewRepository.findByUserAndProduct(userId, input.productId);
    if (existing) {
      throw new AppError("You've already reviewed this product. Edit or delete your existing review instead.", 409);
    }
    return reviewRepository.create(userId, input);
  },

  async delete(userId: string, userRole: string, reviewId: string) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new AppError("Review not found", 404);
    if (review.userId !== userId && userRole !== "admin") {
      throw new AppError("You can only delete your own reviews", 403);
    }
    return reviewRepository.delete(reviewId);
  },
};
