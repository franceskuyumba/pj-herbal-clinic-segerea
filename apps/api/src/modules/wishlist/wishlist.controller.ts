import type { Request, Response } from "express";
import { wishlistService } from "./wishlist.service";

export const wishlistController = {
  async list(req: Request, res: Response) {
    const items = await wishlistService.list(req.user!.id);
    res.json({ success: true, items });
  },
  async add(req: Request, res: Response) {
    const item = await wishlistService.add(req.user!.id, req.params.productId!);
    res.status(201).json({ success: true, item });
  },
  async remove(req: Request, res: Response) {
    await wishlistService.remove(req.user!.id, req.params.productId!);
    res.status(204).send();
  },
};
