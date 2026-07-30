import { prisma } from "../../config/prisma";
import type { ListOrdersQuery } from "./order.schema";

export const orderRepository = {
  findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true, payment: true, delivery: { include: { courier: true } } },
    });
  },

  /** userId === null → admin listing across all customers; otherwise scoped to one customer. */
  findMany(userId: string | null, query: ListOrdersQuery) {
    const where = {
      ...(userId ? { userId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    return Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true, payment: true, delivery: true },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.order.count({ where }),
    ]);
  },

  updateStatus(id: string, status: string) {
    return prisma.order.update({ where: { id }, data: { status: status as never } });
  },
};
