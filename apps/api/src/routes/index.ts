import { Router } from "express";
import { productRoutes } from "../modules/products/product.routes";
import { categoryRoutes } from "../modules/categories/category.routes";
import { reviewRoutes } from "../modules/reviews/review.routes";
import { wishlistRoutes } from "../modules/wishlist/wishlist.routes";
import { addressRoutes } from "../modules/addresses/address.routes";
import { cartRoutes } from "../modules/cart/cart.routes";
import { couponRoutes } from "../modules/coupons/coupon.routes";
import { orderRoutes } from "../modules/orders/order.routes";
import { inventoryRoutes } from "../modules/inventory/inventory.routes";
import { deliveryRoutes } from "../modules/delivery/delivery.routes";
import { blogRoutes } from "../modules/blog/blog.routes";
import { landingPageRoutes } from "../modules/landingpages/landingpage.routes";
import { campaignRoutes } from "../modules/campaigns/campaign.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { analyticsRoutes } from "../modules/analytics/analytics.routes";
import { paymentRoutes } from "../modules/payments/payment.routes";
import { whatsappRoutes } from "../modules/whatsapp/whatsapp.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ success: true, status: "ok" }));

router.use("/auth", authRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/payments", paymentRoutes);
router.use("/whatsapp", whatsappRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/reviews", reviewRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/addresses", addressRoutes);
router.use("/cart", cartRoutes);
router.use("/coupons", couponRoutes);
router.use("/orders", orderRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/delivery", deliveryRoutes);
router.use("/blog", blogRoutes);
router.use("/landing-pages", landingPageRoutes);
router.use("/campaigns", campaignRoutes);

export const apiRouter = router;
