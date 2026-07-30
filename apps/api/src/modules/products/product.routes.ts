import { Router } from "express";
import { productController } from "./product.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import {
  createProductSchema,
  listProductsQuerySchema,
  updateProductSchema,
} from "./product.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Public catalog browsing
router.get("/", validate(listProductsQuerySchema, "query"), asyncHandler(productController.list));
router.get("/:slug", asyncHandler(productController.getBySlug));

// Admin/staff-only mutations
router.post(
  "/",
  requireAuth,
  requireRole("admin", "staff"),
  validate(createProductSchema),
  asyncHandler(productController.create)
);
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin", "staff"),
  validate(updateProductSchema),
  asyncHandler(productController.update)
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(productController.remove)
);

export const productRoutes = router;
