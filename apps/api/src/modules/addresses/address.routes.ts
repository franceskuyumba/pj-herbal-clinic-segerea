import { Router } from "express";
import { addressController } from "./address.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth } from "../../middleware/auth.middleware";
import { createAddressSchema, updateAddressSchema } from "./address.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(addressController.list));
router.post("/", validate(createAddressSchema), asyncHandler(addressController.create));
router.patch("/:id", validate(updateAddressSchema), asyncHandler(addressController.update));
router.delete("/:id", asyncHandler(addressController.remove));

export const addressRoutes = router;
