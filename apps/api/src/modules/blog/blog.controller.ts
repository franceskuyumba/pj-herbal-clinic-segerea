import type { Request, Response } from "express";
import { blogService } from "./blog.service";
import type { CreatePostInput, ListPostsQuery, UpdatePostInput } from "./blog.schema";

export const blogController = {
  async listPublished(req: Request, res: Response) {
    const result = await blogService.listPublished(req.query as unknown as ListPostsQuery);
    res.json({ success: true, ...result });
  },
  async listAllAdmin(req: Request, res: Response) {
    const result = await blogService.listAllAdmin(req.query as unknown as ListPostsQuery);
    res.json({ success: true, ...result });
  },
  async getBySlug(req: Request, res: Response) {
    const post = await blogService.getBySlug(req.params.slug!);
    res.json({ success: true, post });
  },
  async create(req: Request, res: Response) {
    const post = await blogService.create(req.body as CreatePostInput);
    res.status(201).json({ success: true, post });
  },
  async update(req: Request, res: Response) {
    const post = await blogService.update(req.params.id!, req.body as UpdatePostInput);
    res.json({ success: true, post });
  },
  async remove(req: Request, res: Response) {
    await blogService.delete(req.params.id!);
    res.status(204).send();
  },
};
