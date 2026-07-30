import type { Request, Response } from "express";
import { categoryService } from "./category.service";
import type { CreateCategoryInput, UpdateCategoryInput } from "./category.schema";

export const categoryController = {
  async list(_req: Request, res: Response) {
    const categories = await categoryService.list();
    res.json({ success: true, categories });
  },
  async getBySlug(req: Request, res: Response) {
    const category = await categoryService.getBySlug(req.params.slug!);
    res.json({ success: true, category });
  },
  async create(req: Request, res: Response) {
    const category = await categoryService.create(req.body as CreateCategoryInput);
    res.status(201).json({ success: true, category });
  },
  async update(req: Request, res: Response) {
    const category = await categoryService.update(req.params.id!, req.body as UpdateCategoryInput);
    res.json({ success: true, category });
  },
  async remove(req: Request, res: Response) {
    await categoryService.delete(req.params.id!);
    res.status(204).send();
  },
};
