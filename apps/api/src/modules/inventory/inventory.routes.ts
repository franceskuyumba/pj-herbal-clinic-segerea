import { Router } from "express";
import { inventoryController } from "./inventory.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { adjustStockSchema, createBatchSchema } from "./inventory.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Every inventory route is staff/admin only — nothing here is public.
router.use(requireAuth, requireRole("admin", "staff"));

router.get("/low-stock", asyncHandler(inventoryController.lowStock));
router.get("/:productId/history", asyncHandler(inventoryController.history));
router.post("/:productId/adjust", validate(adjustStockSchema), asyncHandler(inventoryController.adjustStock));
router.get("/:productId/batches", asyncHandler(inventoryController.batches));
router.post("/batches", validate(createBatchSchema), asyncHandler(inventoryController.receiveBatch));

export const inventoryRoutes = router;
