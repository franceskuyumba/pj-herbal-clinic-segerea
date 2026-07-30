import { prisma } from "../../config/prisma";

export const cartRepository = {
  async findOrCreateForUser(userId: string) {
    const existing = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (existing) return existing;
    return prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } },
    });
  },

  /** Read-only lookup used by checkout — does NOT create an empty cart, since an empty/missing cart there means "nothing to check out". */
  findByUserId(userId: string) {
    return prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
  },

  findItem(cartId: string, productId: string) {
    return prisma.cartItem.findUnique({ where: { cartId_productId: { cartId, productId } } });
  },

  addItem(cartId: string, productId: string, quantity: number) {
    return prisma.cartItem.create({ data: { cartId, productId, quantity } });
  },

  setItemQuantity(cartId: string, productId: string, quantity: number) {
    return prisma.cartItem.update({
      where: { cartId_productId: { cartId, productId } },
      data: { quantity },
    });
  },

  removeItem(cartId: string, productId: string) {
    return prisma.cartItem.delete({ where: { cartId_productId: { cartId, productId } } });
  },

  clearItems(cartId: string) {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  },

  setCoupon(cartId: string, couponCode: string | null) {
    return prisma.cart.update({ where: { id: cartId }, data: { couponCode } });
  },
};
