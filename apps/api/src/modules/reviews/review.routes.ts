import { Router } from "express";
import { reviewController } from "./review.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth } from "../../middleware/auth.middleware";
import { createReviewSchema } from "./review.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get("/product/:productId", asyncHandler(reviewController.listForProduct));
router.post("/", requireAuth, validate(createReviewSchema), asyncHandler(reviewController.create));
router.delete("/:id", requireAuth, asyncHandler(reviewController.remove));

export const reviewRoutes = router;
