import { cartRepository } from "./cart.repository";
import { productRepository } from "../products/product.repository";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

/**
 * Recomputed on every read rather than cached — the cart is small enough
 * that this costs nothing, and it guarantees totals are never stale
 * (e.g. after an admin changes a price while the customer is browsing).
 */
async function withTotals(cart: Awaited<ReturnType<typeof cartRepository.findOrCreateForUser>>) {
  const subtotalCents = cart.items.reduce(
    (sum, item) => sum + item.product.priceCents * item.quantity,
    0
  );

  let discountCents = 0;
  let coupon = null;
  if (cart.couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: cart.couponCode } });
    if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
      if (coupon.percentOff) discountCents = Math.round((subtotalCents * coupon.percentOff) / 100);
      else if (coupon.amountOffCents) discountCents = coupon.amountOffCents;
      if (coupon.minOrderCents && subtotalCents < coupon.minOrderCents) discountCents = 0;
    } else {
      coupon = null; // expired/inactive coupon silently stops applying rather than erroring on every cart read
    }
  }

  return {
    ...cart,
    subtotalCents,
    discountCents,
    totalCents: Math.max(0, subtotalCents - discountCents),
  };
}

export const cartService = {
  async get(userId: string) {
    const cart = await cartRepository.findOrCreateForUser(userId);
    return withTotals(cart);
  },

  async addItem(userId: string, productId: string, quantity: number) {
    const cart = await cartRepository.findOrCreateForUser(userId);
    const product = await productRepository.findById(productId);
    if (!product) throw new AppError("Product not found", 404);

    const existingItem = cart.items.find((i) => i.productId === productId);
    const newQuantity = (existingItem?.quantity ?? 0) + quantity;

    if (newQuantity > product.stock) {
      throw new AppError(`Only ${product.stock} unit(s) of "${product.name}" available`, 409);
    }

    if (existingItem) {
      await cartRepository.setItemQuantity(cart.id, productId, newQuantity);
    } else {
      await cartRepository.addItem(cart.id, productId, quantity);
    }

    return this.get(userId);
  },

  async updateItemQuantity(userId: string, productId: string, quantity: number) {
    const cart = await cartRepository.findOrCreateForUser(userId);
    const product = await productRepository.findById(productId);
    if (!product) throw new AppError("Product not found", 404);
    if (quantity > product.stock) {
      throw new AppError(`Only ${product.stock} unit(s) of "${product.name}" available`, 409);
    }
    await cartRepository.setItemQuantity(cart.id, productId, quantity);
    return this.get(userId);
  },

  async removeItem(userId: string, productId: string) {
    const cart = await cartRepository.findOrCreateForUser(userId);
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) throw new AppError("Item not in cart", 404);
    await cartRepository.removeItem(cart.id, productId);
    return this.get(userId);
  },

  async applyCoupon(userId: string, code: string) {
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.isActive) throw new AppError("Invalid or inactive coupon code", 404);
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new AppError("Coupon has expired", 410);
    if (coupon.maxRedemptions && coupon.redeemedCount >= coupon.maxRedemptions) {
      throw new AppError("Coupon has reached its redemption limit", 410);
    }
    const cart = await cartRepository.findOrCreateForUser(userId);
    await cartRepository.setCoupon(cart.id, code);
    return this.get(userId);
  },

  async removeCoupon(userId: string) {
    const cart = await cartRepository.findOrCreateForUser(userId);
    await cartRepository.setCoupon(cart.id, null);
    return this.get(userId);
  },
};
