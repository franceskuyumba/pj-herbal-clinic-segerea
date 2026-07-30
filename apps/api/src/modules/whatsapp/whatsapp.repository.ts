import { prisma } from "../../config/prisma";
import type { Prisma } from "@prisma/client";

export const whatsappRepository = {
  logMessage(toPhone: string, templateName: string, status: string, relatedOrderId?: string, payload?: Prisma.InputJsonValue) {
    return prisma.whatsAppMessage.create({
      data: { toPhone, templateName, status, relatedOrderId, payload },
    });
  },

  /** Carts that have items, have gone quiet for `staleMinutes`, and haven't already been reminded. */
  findAbandonedCarts(staleMinutes: number) {
    const cutoff = new Date(Date.now() - staleMinutes * 60_000);
    return prisma.cart.findMany({
      where: {
        reminderSentAt: null,
        lastActivityAt: { lt: cutoff },
        items: { some: {} },
      },
      include: { items: { include: { product: true } }, user: true },
    });
  },

  markReminderSent(cartId: string) {
    return prisma.cart.update({ where: { id: cartId }, data: { reminderSentAt: new Date() } });
  },

  /** Broadcast targets for a campaign — every customer with a phone on file. Segmentation beyond this is future scope; flagged in the Phase 8 doc. */
  findBroadcastablePhones() {
    return prisma.user.findMany({
      where: { role: "customer", phone: { not: null } },
      select: { id: true, phone: true, name: true },
    });
  },
};
