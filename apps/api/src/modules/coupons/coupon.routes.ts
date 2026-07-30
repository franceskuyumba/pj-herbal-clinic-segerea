import { Router } from "express";
import { couponController } from "./coupon.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { createCouponSchema, updateCouponSchema } from "./coupon.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Coupons are admin/staff-managed only — validity checks for a shopper
// happen through POST /api/v1/cart/coupon, not here.
router.use(requireAuth, requireRole("admin", "staff"));

router.get("/", asyncHandler(couponController.list));
router.post("/", validate(createCouponSchema), asyncHandler(couponController.create));
router.patch("/:code", validate(updateCouponSchema), asyncHandler(couponController.update));

export const couponRoutes = router;
