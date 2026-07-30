import { Router } from "express";
import { paymentController } from "./payment.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth } from "../../middleware/auth.middleware";
import { sensitiveRateLimit } from "../../middleware/rateLimit.middleware";
import { flutterwaveWebhookSchema, selcomWebhookSchema } from "./payment.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/:orderId/initiate", requireAuth, sensitiveRateLimit, asyncHandler(paymentController.initiate));
router.post("/:orderId/retry", requireAuth, sensitiveRateLimit, asyncHandler(paymentController.retry));
router.post("/:orderId/confirm-dpo", requireAuth, asyncHandler(paymentController.confirmDpo));

// Webhooks are called by the payment providers themselves, not by our
// frontend — no requireAuth (there's no user session), but every handler
// independently verifies the provider's signature before trusting anything.
router.post("/webhook/selcom", validate(selcomWebhookSchema), asyncHandler(paymentController.selcomWebhook));
router.post("/webhook/flutterwave", validate(flutterwaveWebhookSchema), asyncHandler(paymentController.flutterwaveWebhook));

export const paymentRoutes = router;
