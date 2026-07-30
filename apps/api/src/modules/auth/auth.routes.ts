import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { sensitiveRateLimit } from "../../middleware/rateLimit.middleware";
import { listUsersQuerySchema, updateMeSchema, updateUserRoleSchema } from "./auth.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Not behind requireAuth — sync's whole job IS turning a raw Firebase
// token into our internal user, so it verifies the token itself.
router.post("/sync", sensitiveRateLimit, asyncHandler(authController.sync));

router.get("/me", requireAuth, asyncHandler(authController.me));
router.patch("/me", requireAuth, validate(updateMeSchema), asyncHandler(authController.updateMe));

// Admin: customer/staff management (SRS §10 Customer Management)
router.get(
  "/users",
  requireAuth,
  requireRole("admin", "staff"),
  validate(listUsersQuerySchema, "query"),
  asyncHandler(authController.listUsers)
);
router.patch(
  "/users/:id/role",
  requireAuth,
  requireRole("admin"),
  validate(updateUserRoleSchema),
  asyncHandler(authController.setUserRole)
);

export const authRoutes = router;
