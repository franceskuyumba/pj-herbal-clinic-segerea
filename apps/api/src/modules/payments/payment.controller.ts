import type { Request, Response } from "express";
import { paymentService } from "./payment.service";
import type { FlutterwaveWebhookPayload, SelcomWebhookPayload } from "./payment.schema";

export const paymentController = {
  async initiate(req: Request, res: Response) {
    const result = await paymentService.initiate(req.params.orderId!, req.user!.id);
    res.json({ success: true, ...result });
  },

  async retry(req: Request, res: Response) {
    const result = await paymentService.retry(req.params.orderId!, req.user!.id);
    res.json({ success: true, ...result });
  },

  async confirmDpo(req: Request, res: Response) {
    const result = await paymentService.confirmDpoPayment(req.params.orderId!, req.user!.id);
    res.json({ success: true, ...result });
  },

  // Webhook endpoints respond 200 to any request we successfully processed
  // OR correctly identified as a duplicate — providers retry aggressively
  // on non-2xx responses, and retrying a duplicate is expected/handled,
  // not an error state.
  async selcomWebhook(req: Request, res: Response) {
    const result = await paymentService.handleSelcomWebhook(req.body as SelcomWebhookPayload, req.headers);
    res.status(200).json({ success: true, ...result });
  },

  async flutterwaveWebhook(req: Request, res: Response) {
    const result = await paymentService.handleFlutterwaveWebhook(req.body as FlutterwaveWebhookPayload, req.headers);
    res.status(200).json({ success: true, ...result });
  },
};
