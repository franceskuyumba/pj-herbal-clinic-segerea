import { Router } from "express";
import { wishlistController } from "./wishlist.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(requireAuth); // every wishlist route is a customer's own list

router.get("/", asyncHandler(wishlistController.list));
router.post("/:productId", asyncHandler(wishlistController.add));
router.delete("/:productId", asyncHandler(wishlistController.remove));

export const wishlistRoutes = router;
