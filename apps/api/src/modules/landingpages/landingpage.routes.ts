import { Router } from "express";
import { landingPageController } from "./landingpage.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { createLandingPageSchema, updateLandingPageSchema } from "./landingpage.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get("/admin/all", requireAuth, requireRole("admin", "staff"), asyncHandler(landingPageController.listAdmin));
router.get("/:slug", asyncHandler(landingPageController.getBySlug));

router.post("/", requireAuth, requireRole("admin", "staff"), validate(createLandingPageSchema), asyncHandler(landingPageController.create));
router.patch("/:id", requireAuth, requireRole("admin", "staff"), validate(updateLandingPageSchema), asyncHandler(landingPageController.update));
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(landingPageController.remove));

export const landingPageRoutes = router;
