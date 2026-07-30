import { Router } from "express";
import { campaignController } from "./campaign.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { createCampaignSchema, updateCampaignStatusSchema } from "./campaign.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(requireAuth, requireRole("admin", "staff"));

router.get("/", asyncHandler(campaignController.list));
router.post("/", validate(createCampaignSchema), asyncHandler(campaignController.create));
router.patch("/:id/status", validate(updateCampaignStatusSchema), asyncHandler(campaignController.updateStatus));

export const campaignRoutes = router;
