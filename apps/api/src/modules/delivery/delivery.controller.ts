import type { Request, Response } from "express";
import { deliveryService } from "./delivery.service";
import type { AssignCourierInput, CreateCourierInput, UpdateDeliveryStatusInput } from "./delivery.schema";

export const deliveryController = {
  async getForOrder(req: Request, res: Response) {
    const delivery = await deliveryService.getForOrder(req.params.orderId!);
    res.json({ success: true, delivery });
  },
  async assignCourier(req: Request, res: Response) {
    const { courierId, estimatedAt } = req.body as AssignCourierInput;
    const delivery = await deliveryService.assignCourier(req.params.orderId!, courierId, estimatedAt);
    res.json({ success: true, delivery });
  },
  async updateStatus(req: Request, res: Response) {
    const { status } = req.body as UpdateDeliveryStatusInput;
    const delivery = await deliveryService.updateStatus(req.params.orderId!, status);
    res.json({ success: true, delivery });
  },
  async listCouriers(_req: Request, res: Response) {
    const couriers = await deliveryService.listCouriers();
    res.json({ success: true, couriers });
  },
  async addCourier(req: Request, res: Response) {
    const courier = await deliveryService.addCourier(req.body as CreateCourierInput);
    res.status(201).json({ success: true, courier });
  },
};
