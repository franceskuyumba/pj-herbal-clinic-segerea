import type { Request, Response } from "express";
import { firebaseAuth } from "../../config/firebase-admin";
import { authService } from "./auth.service";
import { AppError } from "../../utils/AppError";
import type { ListUsersQuery, UpdateMeInput, UpdateUserRoleInput } from "./auth.schema";

export const authController = {
  async sync(req: Request, res: Response) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("Missing Authorization header", 401);
    }
    const decoded = await firebaseAuth.verifyIdToken(header.slice("Bearer ".length));
    const user = await authService.syncFromFirebaseToken(decoded);
    res.status(201).json({ success: true, user });
  },

  async me(req: Request, res: Response) {
    const user = await authService.getMe(req.user!.id);
    res.json({ success: true, user });
  },

  async updateMe(req: Request, res: Response) {
    const user = await authService.updateMe(req.user!.id, req.body as UpdateMeInput);
    res.json({ success: true, user });
  },

  async listUsers(req: Request, res: Response) {
    const [items, total] = await authService.listUsers(req.query as unknown as ListUsersQuery);
    res.json({ success: true, items, total });
  },

  async setUserRole(req: Request, res: Response) {
    const { role, permissions } = req.body as UpdateUserRoleInput;
    const user = await authService.setUserRole(req.params.id!, role, permissions);
    res.json({ success: true, user });
  },
};
