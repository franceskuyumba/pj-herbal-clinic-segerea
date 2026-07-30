import type { Request, Response } from "express";
import { reviewService } from "./review.service";
import type { CreateReviewInput } from "./review.schema";

export const reviewController = {
  async listForProduct(req: Request, res: Response) {
    const reviews = await reviewService.listForProduct(req.params.productId!);
    res.json({ success: true, reviews });
  },
  async create(req: Request, res: Response) {
    const review = await reviewService.create(req.user!.id, req.body as CreateReviewInput);
    res.status(201).json({ success: true, review });
  },
  async remove(req: Request, res: Response) {
    await reviewService.delete(req.user!.id, req.user!.role, req.params.id!);
    res.status(204).send();
  },
};
