import { Router } from "express";
import { blogController } from "./blog.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { createPostSchema, listPostsQuerySchema, updatePostSchema } from "./blog.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get("/", validate(listPostsQuerySchema, "query"), asyncHandler(blogController.listPublished));

router.get(
  "/admin/all",
  requireAuth,
  requireRole("admin", "staff"),
  validate(listPostsQuerySchema, "query"),
  asyncHandler(blogController.listAllAdmin)
);

router.get("/:slug", asyncHandler(blogController.getBySlug));

router.post("/", requireAuth, requireRole("admin", "staff"), validate(createPostSchema), asyncHandler(blogController.create));
router.patch("/:id", requireAuth, requireRole("admin", "staff"), validate(updatePostSchema), asyncHandler(blogController.update));
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(blogController.remove));

export const blogRoutes = router;
