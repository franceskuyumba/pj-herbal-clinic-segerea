import { Router } from "express";
import { categoryController } from "./category.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { createCategorySchema, updateCategorySchema } from "./category.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(categoryController.list));
router.get("/:slug", asyncHandler(categoryController.getBySlug));

router.post(
  "/",
  requireAuth,
  requireRole("admin", "staff"),
  validate(createCategorySchema),
  asyncHandler(categoryController.create)
);
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin", "staff"),
  validate(updateCategorySchema),
  asyncHandler(categoryController.update)
);
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(categoryController.remove));

export const categoryRoutes = router;
