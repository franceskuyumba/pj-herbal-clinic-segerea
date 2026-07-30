# Phase 2 — Database Schema
**PJHerbal Clinic · Segerea Branch**

Status: ✅ Complete — built directly against the attached SRS, section by section.

---

## For the customer

Every screen in the SRS — product pages, cart, checkout, order tracking, customer dashboard, admin dashboard, blog, delivery — needs somewhere to store its data permanently. This phase is that storage layer: 21 data tables covering products, orders, payments, deliveries, inventory, reviews, wishlists, coupons, blog posts, and WhatsApp message logs.

Nothing here is visible on the website yet — this is the part underneath the site that remembers everything: what's in stock, who ordered what, whether a payment cleared, where a delivery is. Phase 3 (API) builds the layer that lets the website actually read and write this data.

---

## For the tech team

### SRS → schema traceability

| SRS section | Tables |
|---|---|
| §3 Featured Categories | `Category` |
| §4 Product Page | `Product`, `ProductImage`, `Review` |
| §5 Shopping Cart | `Cart`, `CartItem`, `Coupon` |
| §6 Checkout / §12 Order Management | `Order`, `OrderItem` |
| §7 Payment Integration | `Payment`, `PaymentLog` |
| §9 Customer Account | `Address`, `WishlistItem` (+ `User.orders`) |
| §10 Admin Dashboard / Landing Pages Manager | `LandingPage` |
| §11 Inventory Management | `ProductBatch`, `InventoryLog` |
| §13 Delivery System | `Courier`, `Delivery` |
| §14 Marketing & Sales Automation | `PromoCampaign`, `Coupon` |
| §8 WhatsApp Integration | `WhatsAppMessage` |
| §3 Health Blogs / §16 SEO | `BlogPost` (with `metaTitle`/`metaDescription` on every content model) |
| §17 Security — admin role permissions | `User.role` + `User.permissions[]` |

### Key design decisions

**Money is stored in cents (`Int`), never `Float`.** `priceCents: 1200000` = TSh 12,000. This avoids the floating-point rounding errors that are a classic source of "totals don't add up" bugs in e-commerce checkouts.

**Order line items snapshot product data.** `OrderItem.productName` and `unitPriceCents` are copied at purchase time rather than always joining back to `Product`. If a product's name or price changes next month, historical orders and invoices still show exactly what the customer paid for and how much — this is a legal/accounting requirement, not just a convenience.

**Stock has two layers.** `Product.stock` is the fast-to-read current total the storefront checks against. `InventoryLog` is an append-only ledger of every change (`-2` for a sale, `+50` for a restock) with a reason — so "why is stock at 3?" always has an answer, and low-stock alerts (§11) can be computed without recomputing history.

**Payments have their own audit trail.** `PaymentLog` is append-only and stores the raw webhook payload from Selcom/Flutterwave/DPO alongside a status event. This is what makes "transaction verification" and "payment logs" (§7) real rather than just a status field that silently overwrites itself.

**Role-based access has two levels.** `User.role` (`customer` / `staff` / `admin`) gates broad access; `User.permissions: string[]` (e.g. `["orders:manage", "inventory:manage"]`) allows granting a staff member narrower capabilities without a full admin role — covers §17's "admin role permissions" without a full RBAC table system that this project doesn't need yet.

**Abandoned-cart automation reads directly off `Cart`.** `lastActivityAt` (auto-updated) and `reminderSentAt` let a scheduled job in Phase 8 find carts that have gone quiet and haven't been reminded yet, with no separate tracking table required.

### Relations at a glance

```
User ──< Address
User ──< Order ──< OrderItem >── Product ──< ProductImage
User ──< Review >── Product          Product >── Category
User ──< WishlistItem >── Product    Product ──< ProductBatch
User ── Cart ──< CartItem >── Product Product ──< InventoryLog
Order ── Payment ──< PaymentLog
Order ── Delivery >── Courier
Order >── Coupon
```

### Migration plan

```bash
# From apps/api, with DATABASE_URL pointing at the dev Postgres container:
npm run db:migrate     # creates the initial migration from this schema
npm run db:seed        # loads categories + one sample product
npm run db:studio      # opens Prisma Studio to inspect data visually
```

One additional constraint the Prisma schema can't express directly — added as a raw SQL check in the generated migration:

```sql
ALTER TABLE "Review" ADD CONSTRAINT rating_range CHECK (rating BETWEEN 1 AND 5);
```

### What's intentionally deferred

- **Full-text search** — Phase 3's product search endpoint uses Postgres `ILIKE` to start (matches the SRS's functional requirement); can be upgraded to `pg_trgm` or a search service later without a schema change.
- **Multi-language / multi-branch fields** (§20 Future Scalability) — deliberately not added now. Adding them speculatively would mean carrying unused columns through every phase; they're a schema migration when that phase of the business actually arrives.
- **A dedicated analytics event table** — sales/conversion/traffic analytics (§15) are served by Google Analytics/Meta Pixel/TikTok Pixel client-side plus queries against `Order`/`Payment` for revenue reporting, rather than PJHerbal running its own event-tracking pipeline.

---

## Next: Phase 3 — API Development

Full Express module for every table above, following the `products` reference pattern from Phase 1 (routes → validation → controller → service → repository): auth, cart, orders, payments (with Selcom/Flutterwave/DPO webhook handlers), inventory, delivery, blog, coupons, wishlist, and campaigns — plus the OpenAPI/API documentation.
