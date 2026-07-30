import { Router } from "express";
import { deliveryController } from "./delivery.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { assignCourierSchema, createCourierSchema, updateDeliveryStatusSchema } from "./delivery.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Customers can view their own order's delivery status via the orders
// module response (delivery is included there); this module's routes are
// the staff-facing operations that change delivery state.
router.use(requireAuth, requireRole("admin", "staff"));

router.get("/couriers", asyncHandler(deliveryController.listCouriers));
router.post("/couriers", validate(createCourierSchema), asyncHandler(deliveryController.addCourier));
router.get("/:orderId", asyncHandler(deliveryController.getForOrder));
router.post("/:orderId/assign", validate(assignCourierSchema), asyncHandler(deliveryController.assignCourier));
router.patch("/:orderId/status", validate(updateDeliveryStatusSchema), asyncHandler(deliveryController.updateStatus));

export const deliveryRoutes = router;
