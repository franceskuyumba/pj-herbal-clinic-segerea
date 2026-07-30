import type { Request, Response } from "express";
import { inventoryService } from "./inventory.service";
import type { AdjustStockInput, CreateBatchInput } from "./inventory.schema";

export const inventoryController = {
  async lowStock(_req: Request, res: Response) {
    const products = await inventoryService.lowStock();
    res.json({ success: true, products });
  },
  async history(req: Request, res: Response) {
    const logs = await inventoryService.history(req.params.productId!);
    res.json({ success: true, logs });
  },
  async adjustStock(req: Request, res: Response) {
    await inventoryService.adjustStock(req.params.productId!, req.body as AdjustStockInput);
    res.json({ success: true });
  },
  async batches(req: Request, res: Response) {
    const batches = await inventoryService.batches(req.params.productId!);
    res.json({ success: true, batches });
  },
  async receiveBatch(req: Request, res: Response) {
    await inventoryService.receiveBatch(req.body as CreateBatchInput);
    res.status(201).json({ success: true });
  },
};
