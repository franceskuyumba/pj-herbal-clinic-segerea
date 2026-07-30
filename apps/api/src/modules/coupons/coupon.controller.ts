import type { Request, Response } from "express";
import { couponService } from "./coupon.service";
import type { CreateCouponInput, UpdateCouponInput } from "./coupon.schema";

export const couponController = {
  async list(_req: Request, res: Response) {
    const coupons = await couponService.list();
    res.json({ success: true, coupons });
  },
  async create(req: Request, res: Response) {
    const coupon = await couponService.create(req.body as CreateCouponInput);
    res.status(201).json({ success: true, coupon });
  },
  async update(req: Request, res: Response) {
    const coupon = await couponService.update(req.params.code!, req.body as UpdateCouponInput);
    res.json({ success: true, coupon });
  },
};
