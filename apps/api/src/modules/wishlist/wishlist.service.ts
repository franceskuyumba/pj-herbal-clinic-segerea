import { wishlistRepository } from "./wishlist.repository";
import { AppError } from "../../utils/AppError";

export const wishlistService = {
  list(userId: string) {
    return wishlistRepository.findByUser(userId);
  },

  async add(userId: string, productId: string) {
    const existing = await wishlistRepository.find(userId, productId);
    if (existing) return existing; // idempotent — adding twice is a no-op, not an error
    return wishlistRepository.add(userId, productId);
  },

  async remove(userId: string, productId: string) {
    const existing = await wishlistRepository.find(userId, productId);
    if (!existing) throw new AppError("Item not in wishlist", 404);
    return wishlistRepository.remove(userId, productId);
  },
};
