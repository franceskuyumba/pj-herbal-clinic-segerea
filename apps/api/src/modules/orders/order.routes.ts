import { Router } from "express";
import { orderController } from "./order.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { sensitiveRateLimit } from "../../middleware/rateLimit.middleware";
import { checkoutSchema, listOrdersQuerySchema, updateOrderStatusSchema } from "./order.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

// Customer routes
router.post("/checkout", sensitiveRateLimit, validate(checkoutSchema), asyncHandler(orderController.checkout));
router.get("/mine", validate(listOrdersQuerySchema, "query"), asyncHandler(orderController.listMine));
router.get("/:id", asyncHandler(orderController.getById));
router.post("/:id/cancel", asyncHandler(orderController.cancelOwn));

// Admin/staff routes
router.get(
  "/",
  requireRole("admin", "staff"),
  validate(listOrdersQuerySchema, "query"),
  asyncHandler(orderController.listAll)
);
router.patch(
  "/:id/status",
  requireRole("admin", "staff"),
  validate(updateOrderStatusSchema),
  asyncHandler(orderController.updateStatus)
);

export const orderRoutes = router;
