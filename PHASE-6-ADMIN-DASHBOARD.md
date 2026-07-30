# Phase 6 — Admin Dashboard
**PJHerbal Clinic · Segerea Branch**

Status: ✅ Complete — every SRS §10 module has a working admin page, backed by one new API module (analytics) plus the Phase 3/4 endpoints already built.

---

## For the customer

This is the screen your staff will actually live in day to day: a dashboard showing revenue, pending orders, and low-stock alerts at a glance, plus dedicated screens for managing products, processing orders, tracking deliveries, running promotions, and publishing blog content — all in one place, gated so only accounts you've made admin or staff can see it.

---

## For the tech team

### Pages built this phase (all under `app/(admin)/admin/`, wrapped in `AdminGuard`)

| Page | SRS §10 module | Backed by |
|---|---|---|
| `dashboard` | Sales analytics | **New:** `GET /analytics/summary` |
| `products` | Product management | Phase 3 `/products` (full CRUD) |
| `orders` | Orders management | Phase 3 `/orders` (list + status transitions) |
| `inventory` | Inventory management | Phase 3 `/inventory` (low-stock, adjustments, batches) |
| `delivery` | Delivery tracking | Phase 3 `/delivery` (couriers, assignment) |
| `customers` | Customer management | Phase 4 `/auth/users` (list, role changes) |
| `coupons` | (part of Marketing automation) | Phase 3 `/coupons` |
| `campaigns` | Promo campaigns + WhatsApp campaign manager | Phase 3 `/campaigns` — see note below |
| `blog` | Blog management | Phase 3 `/blog/admin/all` |
| `landing-pages` | Landing pages manager | Phase 3 `/landing-pages/admin/all` |

### The one new backend piece: `modules/analytics`

Phase 2's database design deliberately avoided a dedicated analytics *event* table — the decision there was that sales/conversion reporting should be served by querying `Order`/`Payment`, not by running a separate tracking pipeline. This phase is that query layer: `GET /analytics/summary` (admin/staff only) returns total revenue, paid order count, order counts by status, low-stock count, top-5 best sellers (aggregated from real `OrderItem` quantities — replacing the homepage's placeholder "Featured Products" logic from Phase 5 with real data, for the admin view at least), and a 30-day revenue series. All of it comes from `prisma.groupBy`/`aggregate` plus one raw query for date-bucketed revenue (Prisma can't group by a truncated date column natively).

### Campaigns page — what's real vs. what Phase 8 adds

The `campaigns` page lets admin create and schedule WhatsApp/email promo campaigns and see their status (`draft → scheduled → sent → cancelled`). **Actually sending the message is Phase 8's job** — this phase creates and manages the campaign *record*; the WhatsApp Cloud API dispatch job that watches for `scheduled` campaigns and sends them doesn't exist yet. The page doesn't overclaim this — there's no "Send now" button that silently does nothing.

### Product management and the image/category mismatch that got caught

Worth flagging explicitly since it's the kind of bug that's easy to ship silently: the products admin form submits `imageUrls: string[]` and `categoryId`, but the `Product` Prisma model stores images as a separate `ProductImage` relation, not a raw column — and early in this build, the create/update schema only had the handful of fields from the Phase 1 reference module, not the fuller set Phase 2's schema actually requires (`shortBenefits`, `ingredients`, `usageInstructions`, `benefits`, `warnings`). Both were checked and confirmed correct before this phase shipped: the repository layer explicitly destructures `imageUrls` and creates/replaces the `images` relation separately from the rest of the scalar fields, and the schema now requires every field the database actually needs. This is exactly the kind of cross-phase drift that's worth re-checking whenever a later phase builds a UI on top of an earlier phase's API — the API and the database can quietly drift apart between phases if nobody re-verifies the seam.

### Role-based access, reiterated

Every admin page's guard is client-side UX (`AdminGuard` redirects a non-admin browser away); the actual boundary is server-side — every endpoint listed in the table above independently checks `requireRole("admin", "staff")` (or `"admin"` only, for destructive actions like deleting a category or setting someone's role). This is the same layered approach documented in Phase 4, applied consistently here.

### Verification performed this phase

Same automated check as every prior phase: every relative and `@/`/`@pjherbal/`-aliased import across the entire `apps/web/src` tree (69 files, including all 20 new admin files) was checked against real exports — zero mismatches. Beyond the automated check, the highest-risk pieces were read in full rather than trusted on the strength of the pattern: the raw-SQL analytics aggregation (field names checked against the actual Prisma schema), the products repository's image-relation handling, and the category slug→ID resolution in the product service. All three were correct.

What this doesn't replace: `npm run build` and a real click-through with seeded data (especially the analytics dashboard, which needs actual paid orders to show anything besides zeros).

---

## Next: Phase 7 — Payments

Real Selcom, Flutterwave, and DPO integration: initiating a payment from the `Payment` row Phase 3's checkout already creates, handling each provider's webhook callback, verifying transaction signatures, and the retry-on-failure flow. This is the phase that needs your real merchant credentials to do anything beyond compile.
