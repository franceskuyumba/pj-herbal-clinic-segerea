import { couponRepository } from "./coupon.repository";
import { AppError } from "../../utils/AppError";
import type { CreateCouponInput, UpdateCouponInput } from "./coupon.schema";

export const couponService = {
  list() {
    return couponRepository.findAll();
  },

  async create(input: CreateCouponInput) {
    const existing = await couponRepository.findByCode(input.code);
    if (existing) throw new AppError(`Coupon code "${input.code}" already exists`, 409);
    return couponRepository.create(input);
  },

  async update(code: string, input: UpdateCouponInput) {
    const existing = await couponRepository.findByCode(code);
    if (!existing) throw new AppError("Coupon not found", 404);
    return couponRepository.update(code, input);
  },
};
