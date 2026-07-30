import type { Request, Response } from "express";
import { cartService } from "./cart.service";
import type { AddCartItemInput, ApplyCouponInput, UpdateCartItemInput } from "./cart.schema";

export const cartController = {
  async get(req: Request, res: Response) {
    const result = await cartService.get(req.user!.id);
    res.json({ success: true, cart: result });
  },

  async addItem(req: Request, res: Response) {
    const { productId, quantity } = req.body as AddCartItemInput;
    const result = await cartService.addItem(req.user!.id, productId, quantity);
    res.status(201).json({ success: true, cart: result });
  },

  async updateItem(req: Request, res: Response) {
    const { quantity } = req.body as UpdateCartItemInput;
    const result = await cartService.updateItemQuantity(req.user!.id, req.params.productId!, quantity);
    res.json({ success: true, cart: result });
  },

  async removeItem(req: Request, res: Response) {
    const result = await cartService.removeItem(req.user!.id, req.params.productId!);
    res.json({ success: true, cart: result });
  },

  async applyCoupon(req: Request, res: Response) {
    const { code } = req.body as ApplyCouponInput;
    const result = await cartService.applyCoupon(req.user!.id, code);
    res.json({ success: true, cart: result });
  },

  async removeCoupon(req: Request, res: Response) {
    const result = await cartService.removeCoupon(req.user!.id);
    res.json({ success: true, cart: result });
  },
};
