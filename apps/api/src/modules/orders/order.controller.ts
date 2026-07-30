import type { Request, Response } from "express";
import { orderService } from "./order.service";
import type { CheckoutInput, ListOrdersQuery, UpdateOrderStatusInput } from "./order.schema";

export const orderController = {
  async checkout(req: Request, res: Response) {
    const order = await orderService.checkout(req.user!.id, req.body as CheckoutInput);
    res.status(201).json({ success: true, order });
  },

  async listMine(req: Request, res: Response) {
    const result = await orderService.list(req.user!.id, req.query as unknown as ListOrdersQuery);
    res.json({ success: true, ...result });
  },

  async listAll(req: Request, res: Response) {
    const result = await orderService.list(null, req.query as unknown as ListOrdersQuery);
    res.json({ success: true, ...result });
  },

  async getById(req: Request, res: Response) {
    const order = await orderService.getById(req.params.id!, req.user!);
    res.json({ success: true, order });
  },

  async updateStatus(req: Request, res: Response) {
    const { status } = req.body as UpdateOrderStatusInput;
    const order = await orderService.updateStatus(req.params.id!, status);
    res.json({ success: true, order });
  },

  async cancelOwn(req: Request, res: Response) {
    const order = await orderService.cancelOwnOrder(req.params.id!, req.user!.id);
    res.json({ success: true, order });
  },
};
