import type { Request, Response } from "express";
import { productService } from "./product.service";
import type { CreateProductInput, ListProductsQuery, UpdateProductInput } from "./product.schema";

export const productController = {
  async list(req: Request, res: Response) {
    const result = await productService.list(req.query as unknown as ListProductsQuery);
    res.json({ success: true, ...result });
  },

  async getBySlug(req: Request, res: Response) {
    const product = await productService.getBySlug(req.params.slug!);
    res.json({ success: true, product });
  },

  async create(req: Request, res: Response) {
    const product = await productService.create(req.body as CreateProductInput);
    res.status(201).json({ success: true, product });
  },

  async update(req: Request, res: Response) {
    const product = await productService.update(req.params.id!, req.body as UpdateProductInput);
    res.json({ success: true, product });
  },

  async remove(req: Request, res: Response) {
    await productService.delete(req.params.id!);
    res.status(204).send();
  },
};
