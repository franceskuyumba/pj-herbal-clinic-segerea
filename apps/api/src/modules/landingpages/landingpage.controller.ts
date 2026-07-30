import type { Request, Response } from "express";
import { landingPageService } from "./landingpage.service";
import type { CreateLandingPageInput, UpdateLandingPageInput } from "./landingpage.schema";

export const landingPageController = {
  async listAdmin(_req: Request, res: Response) {
    const pages = await landingPageService.listAdmin();
    res.json({ success: true, pages });
  },
  async getBySlug(req: Request, res: Response) {
    const page = await landingPageService.getPublishedBySlug(req.params.slug!);
    res.json({ success: true, page });
  },
  async create(req: Request, res: Response) {
    const page = await landingPageService.create(req.body as CreateLandingPageInput);
    res.status(201).json({ success: true, page });
  },
  async update(req: Request, res: Response) {
    const page = await landingPageService.update(req.params.id!, req.body as UpdateLandingPageInput);
    res.json({ success: true, page });
  },
  async remove(req: Request, res: Response) {
    await landingPageService.delete(req.params.id!);
    res.status(204).send();
  },
};
