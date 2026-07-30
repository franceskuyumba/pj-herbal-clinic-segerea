# Phase 5 — Frontend
**PJHerbal Clinic · Segerea Branch**

Status: ✅ Complete — every customer-facing route from the SRS site map (§2) now has a real page.

---

## For the customer

Every page a shopper actually clicks through now exists and works against the real API from Phase 3: homepage, shop with search/filters, product pages with reviews and related items, cart, checkout with delivery-fee calculation, order confirmation, order tracking in the customer dashboard, wishlist, saved addresses, and the health blog. Nothing here is a static mockup — adding a product to cart, applying a coupon, and placing an order all hit the real backend and change real data.

---

## For the tech team

### Pages built this phase

| SRS route | File | Notes |
|---|---|---|
| `/` | `app/(customer)/page.tsx` | Hero, categories, featured products, why-us, testimonials |
| `/shop` | `app/(customer)/shop/page.tsx` | Search + category filter + pagination |
| `/product/{slug}` | `app/(customer)/product/[slug]/page.tsx` | Gallery, tabs, reviews, related products, wishlist |
| `/cart` | `app/(customer)/cart/page.tsx` | Quantity edit, remove, coupon apply |
| `/checkout` | `app/(customer)/checkout/page.tsx` | react-hook-form + Zod, payment method selection |
| `/order-success` | `app/(customer)/order-success/page.tsx` | Reads `?orderId=` |
| `/customer-dashboard` | `app/(customer)/customer-dashboard/page.tsx` | Orders / Wishlist / Addresses / Account tabs |
| `/blog`, `/blog/{slug}` | `app/(customer)/blog/**` | |
| `/about`, `/contact`, `/privacy-policy`, `/terms` | `app/(customer)/**` | Contact form routes to WhatsApp (no dedicated inbox endpoint exists yet) |
| `/login`, `/signup` | `app/(auth)/**` | Built in Phase 4 |

### Data layer: `lib/hooks/*`

Every page reads/writes through a small React Query hook, not direct `fetch` calls in components: `useProducts`, `useProduct`, `useCategories`, `useCart`, `useOrders`/`useCheckout`, `useReviews`, `useWishlist`, `useAddresses`, `useBlog`. This keeps caching, invalidation, and loading states consistent, and means every page's data logic is testable independent of its JSX.

### The checkout → payment-method mapping

The SRS lists payment methods (M-Pesa, Tigo Pesa, Airtel Money, HaloPesa, CRDB, NMB) as what the *customer* sees, but the API's `checkout` endpoint also needs a `paymentProvider` (Selcom/Flutterwave/DPO) to know which gateway to call in Phase 7. Asking a shopper to pick a payment *processor* on top of a payment *method* would be confusing and is a business/backend routing decision, not a customer decision — so `lib/validators/checkout.ts` maps method → provider (mobile money → Selcom, bank transfer → Flutterwave) and sends both. That mapping is one constant to change if the real gateway assignment differs.

### Forms and validation

Every form in this phase (checkout, contact, address, login/signup from Phase 4) uses `react-hook-form` + a `zod` schema, with the same Tanzanian phone-number pattern enforced everywhere it appears. Server-side, the same shape is re-validated by the Phase 3 Zod schemas — client validation is UX, server validation is the actual guarantee.

### Design system

Dark, botanical palette (deep green / warm gold / ivory) defined once in `tailwind.config.ts` (`brand.*` tokens) and used everywhere — no page reaches for an arbitrary hex value. `Fraunces` (display serif) for headings, `IBM Plex Sans` for body, `IBM Plex Mono` for prices/order numbers. Framer Motion is used for scroll-in reveals on product cards and the hero — subtle, not decorative for its own sake.

### Known simplifications, stated plainly

- **"Featured Products" on the homepage is not yet a real best-sellers ranking** — it shows the latest products. A genuine ranking would aggregate `OrderItem` quantities, which is natural Phase 6 admin-analytics territory. The code comment where this happens says so.
- **Testimonials are static copy**, not pulled from the `Review` table — there isn't enough real review volume yet for a "top rated" query to be meaningful. Swappable once there is.
- **The contact form has no dedicated backend endpoint** — it opens a pre-filled WhatsApp message instead, which is genuinely functional today rather than silently doing nothing. A real inbox-backed endpoint is a reasonable addition if form volume grows.
- **Delivery fee is a flat two-tier rate** (Dar es Salaam vs. everywhere else), matching what Phase 3's `computeDeliveryFee` actually implements — not a live courier-based quote (that's the SRS §13 delivery system's future scope).

### Verification performed this phase

Same approach as Phase 3: every relative and `@/`-aliased import across all of `apps/web/src` was checked programmatically against real exports before packaging. Two real gaps were caught and fixed this way — `ProductDTO` in `shared-types` was missing `ingredients`/`usageInstructions`/`benefits`/`warnings` (the product detail page needed them), and `OrderDTO` was missing `items` and address fields (the order-success and dashboard pages needed them). Both are now aligned with what the Phase 3 API actually returns.

What this doesn't replace: running `npm run build` for real. Client/server component boundaries, `"use client"` placement, and Next.js-specific type-checking can only be fully verified by Next.js's own compiler — do that before treating this as final.

---

## Next: Phase 6 — Admin Dashboard

Orders management, inventory management, product management, customer management, sales analytics (including a real best-sellers query), delivery tracking, promo campaigns, WhatsApp campaign manager, blog management, and landing pages manager — the `(admin)` route group, currently just an `AdminGuard`-wrapped shell.
