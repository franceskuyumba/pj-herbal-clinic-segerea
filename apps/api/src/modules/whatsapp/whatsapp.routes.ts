import { Router } from "express";
import { whatsappController } from "./whatsapp.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { sendCampaignSchema } from "./whatsapp.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Meta calls these directly — no auth, verified by the handshake/token instead.
router.get("/webhook", whatsappController.verifyWebhook);
router.post("/webhook", asyncHandler(whatsappController.receiveMessage));

// Admin-only dispatch actions.
router.post("/campaigns/:id/send", requireAuth, requireRole("admin", "staff"), asyncHandler(whatsappController.sendCampaign));
router.post("/broadcast", requireAuth, requireRole("admin"), validate(sendCampaignSchema), asyncHandler(whatsappController.sendAdHocBroadcast));

export const whatsappRoutes = router;
