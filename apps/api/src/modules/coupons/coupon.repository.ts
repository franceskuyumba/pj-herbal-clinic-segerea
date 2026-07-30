import { prisma } from "../../config/prisma";
import type { CreateCouponInput, UpdateCouponInput } from "./coupon.schema";

export const couponRepository = {
  findAll() {
    return prisma.coupon.findMany({ orderBy: { id: "desc" } });
  },
  findByCode(code: string) {
    return prisma.coupon.findUnique({ where: { code } });
  },
  create(data: CreateCouponInput) {
    return prisma.coupon.create({
      data: { ...data, expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined },
    });
  },
  update(code: string, data: UpdateCouponInput) {
    return prisma.coupon.update({
      where: { code },
      data: { ...data, expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined },
    });
  },
  incrementRedemption(code: string) {
    return prisma.coupon.update({ where: { code }, data: { redeemedCount: { increment: 1 } } });
  },
};
