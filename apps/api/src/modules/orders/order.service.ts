import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { generateOrderNumber } from "../../utils/orderNumber";
import { orderRepository } from "./order.repository";
import { cartRepository } from "../cart/cart.repository";
import { whatsappService } from "../whatsapp/whatsapp.service";
import type { OrderStatus } from "@prisma/client";
import type { CheckoutInput, ListOrdersQuery } from "./order.schema";

// Valid forward transitions. Anything not listed here (including going
// backwards) is rejected — this is what makes "order status" a real
// state machine instead of a free-text field an admin can set to anything.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["dispatched", "cancelled"],
  dispatched: ["delivered"],
  delivered: [],
  cancelled: [],
};

/** Flat delivery fee by region, until Phase 13's courier-based calculation lands. */
const DELIVERY_FEE_CENTS_DAR = 300000; // TSh 3,000
const DELIVERY_FEE_CENTS_OTHER = 700000; // TSh 7,000

export function computeDeliveryFee(region: string): number {
  return region.trim().toLowerCase().includes("dar es salaam")
    ? DELIVERY_FEE_CENTS_DAR
    : DELIVERY_FEE_CENTS_OTHER;
}

export const orderService = {
  async list(userId: string | null, query: ListOrdersQuery) {
    const [items, total] = await orderRepository.findMany(userId, query);
    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async getById(id: string, requestingUser: { id: string; role: string }) {
    const order = await orderRepository.findById(id);
    if (!order) throw new AppError("Order not found", 404);
    const isOwner = order.userId === requestingUser.id;
    const isStaff = requestingUser.role === "admin" || requestingUser.role === "staff";
    if (!isOwner && !isStaff) throw new AppError("Forbidden", 403);
    return order;
  },

  /**
   * Checkout: turns the customer's cart into an Order + OrderItems,
   * reserves stock (with an inventory log entry per line), applies any
   * coupon already attached to the cart, and creates the Payment record
   * in "initiated" status. Selcom/Flutterwave/DPO calls happen in Phase 7
   * — this only creates the row the payment webhook will later update.
   *
   * Wrapped in a single Prisma transaction so a mid-checkout failure never
   * leaves stock decremented without an order, or an order without stock
   * reserved.
   */
  async checkout(userId: string, input: CheckoutInput) {
    const cart = await cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new AppError("Your cart is empty", 400);
    }

    return prisma.$transaction(async (tx) => {
      // Re-check stock inside the transaction — the cart may have gone
      // stale between the customer loading the checkout page and submitting it.
      for (const item of cart.items) {
        const product = await tx.product.findUniqueOrThrow({ where: { id: item.productId } });
        if (product.stock < item.quantity) {
          throw new AppError(
            `Only ${product.stock} unit(s) of "${product.name}" left in stock`,
            409
          );
        }
      }

      let discountCents = 0;
      let couponId: string | null = null;
      const subtotalCents = cart.items.reduce(
        (sum, item) => sum + item.product.priceCents * item.quantity,
        0
      );

      if (cart.couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: cart.couponCode } });
        if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
          discountCents = coupon.percentOff
            ? Math.round((subtotalCents * coupon.percentOff) / 100)
            : coupon.amountOffCents ?? 0;
          couponId = coupon.id;
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { redeemedCount: { increment: 1 } },
          });
        }
      }

      const deliveryFeeCents = computeDeliveryFee(input.region);
      const totalCents = Math.max(0, subtotalCents - discountCents) + deliveryFeeCents;

      const orderCount = await tx.order.count();
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(orderCount + 1),
          userId,
          fullName: input.fullName,
          phone: input.phone,
          email: input.email,
          region: input.region,
          district: input.district,
          streetLine: input.streetLine,
          subtotalCents,
          deliveryFeeCents,
          discountCents,
          totalCents,
          couponId,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              unitPriceCents: item.product.priceCents,
              quantity: item.quantity,
            })),
          },
          payment: {
            create: {
              provider: input.paymentProvider,
              method: input.paymentMethod,
              amountCents: totalCents,
              status: "initiated",
              logs: { create: { event: "initiated" } },
            },
          },
          delivery: { create: { status: "unassigned", feeCents: deliveryFeeCents } },
        },
        include: { items: true, payment: true, delivery: true },
      });

      // Reserve stock + write the audit trail for each line item.
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: "order_placed",
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({ where: { id: cart.id }, data: { couponCode: null } });

      return order;
    }).then(async (order) => {
      // Deliberately outside the transaction — an external WhatsApp API
      // call must never hold a database transaction open, and
      // sendOrderConfirmation already swallows its own errors (a
      // notification failure must never fail a checkout that already
      // succeeded).
      await whatsappService.sendOrderConfirmation(order);
      return order;
    });
  },

  async updateStatus(id: string, nextStatus: OrderStatus) {
    const order = await orderRepository.findById(id);
    if (!order) throw new AppError("Order not found", 404);

    const allowed = ALLOWED_TRANSITIONS[order.status];
    if (!allowed.includes(nextStatus)) {
      throw new AppError(
        `Cannot move order from "${order.status}" to "${nextStatus}"`,
        409
      );
    }

    // Cancelling restores stock — the only status change with a side effect.
    if (nextStatus === "cancelled") {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              change: item.quantity,
              reason: "order_cancelled",
            },
          });
        }
        await tx.order.update({ where: { id }, data: { status: nextStatus } });
      });
      return orderRepository.findById(id);
    }

    await orderRepository.updateStatus(id, nextStatus);
    return orderRepository.findById(id);
  },

  async cancelOwnOrder(id: string, userId: string) {
    const order = await orderRepository.findById(id);
    if (!order) throw new AppError("Order not found", 404);
    if (order.userId !== userId) throw new AppError("Forbidden", 403);
    if (order.status !== "pending") {
      throw new AppError("Only pending orders can be cancelled by the customer", 409);
    }
    return this.updateStatus(id, "cancelled");
  },
};
