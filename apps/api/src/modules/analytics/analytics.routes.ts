import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(requireAuth, requireRole("admin", "staff"));
router.get("/summary", asyncHandler(analyticsController.summary));

export const analyticsRoutes = router;
