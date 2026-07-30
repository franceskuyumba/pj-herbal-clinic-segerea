import { Router } from "express";
import { cartController } from "./cart.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth } from "../../middleware/auth.middleware";
import { addCartItemSchema, applyCouponSchema, updateCartItemSchema } from "./cart.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Every cart route requires a signed-in customer — carts are always tied
// to a user, never anonymous, to keep abandoned-cart automation and stock
// reservation logic simple (SRS §5, §14).
router.use(requireAuth);

router.get("/", asyncHandler(cartController.get));
router.post("/items", validate(addCartItemSchema), asyncHandler(cartController.addItem));
router.patch(
  "/items/:productId",
  validate(updateCartItemSchema),
  asyncHandler(cartController.updateItem)
);
router.delete("/items/:productId", asyncHandler(cartController.removeItem));
router.post("/coupon", validate(applyCouponSchema), asyncHandler(cartController.applyCoupon));
router.delete("/coupon", asyncHandler(cartController.removeCoupon));

export const cartRoutes = router;
