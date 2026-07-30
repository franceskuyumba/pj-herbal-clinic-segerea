import { prisma } from "../../config/prisma";
import type { CreateCourierInput } from "./delivery.schema";

export const deliveryRepository = {
  findByOrderId(orderId: string) {
    return prisma.delivery.findUnique({ where: { orderId }, include: { courier: true } });
  },
  assignCourier(orderId: string, courierId: string, estimatedAt?: Date) {
    return prisma.delivery.update({
      where: { orderId },
      data: { courierId, status: "assigned", estimatedAt },
    });
  },
  updateStatus(orderId: string, status: string) {
    return prisma.delivery.update({
      where: { orderId },
      data: {
        status: status as never,
        deliveredAt: status === "delivered" ? new Date() : undefined,
      },
    });
  },
  listCouriers() {
    return prisma.courier.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  },
  createCourier(data: CreateCourierInput) {
    return prisma.courier.create({ data });
  },
};
