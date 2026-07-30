import { deliveryRepository } from "./delivery.repository";
import { orderRepository } from "../orders/order.repository";
import { whatsappService } from "../whatsapp/whatsapp.service";
import { AppError } from "../../utils/AppError";
import type { CreateCourierInput } from "./delivery.schema";

export const deliveryService = {
  async getForOrder(orderId: string) {
    const delivery = await deliveryRepository.findByOrderId(orderId);
    if (!delivery) throw new AppError("No delivery record for this order", 404);
    return delivery;
  },

  assignCourier(orderId: string, courierId: string, estimatedAt?: string) {
    return deliveryRepository.assignCourier(orderId, courierId, estimatedAt ? new Date(estimatedAt) : undefined);
  },

  async updateStatus(orderId: string, status: string) {
    const delivery = await deliveryRepository.updateStatus(orderId, status);

    // Notification is best-effort and must never fail the status update
    // itself — fetch the order separately rather than folding it into
    // the update query above, and let sendDeliveryUpdate's own internal
    // error handling absorb a lookup or send failure.
    const order = await orderRepository.findById(orderId);
    if (order) await whatsappService.sendDeliveryUpdate(order, status);

    return delivery;
  },

  listCouriers() {
    return deliveryRepository.listCouriers();
  },

  addCourier(input: CreateCourierInput) {
    return deliveryRepository.createCourier(input);
  },
};
