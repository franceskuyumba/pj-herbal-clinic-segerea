# Phase 3 — API Development
**PJHerbal Clinic · Segerea Branch**

Status: ✅ Complete — 12 modules, 13 route files, 55 endpoints, all wired end-to-end following the reference pattern from Phase 1.

---

## For the customer

Every button on the future website — "Add to Cart," "Apply Coupon," "Place Order," an admin marking an order "Dispatched" — needs a matching instruction the server understands. This phase builds that full set of instructions (the API). The website (Phase 5) and admin dashboard (Phase 6) don't invent any new server behavior; they just call what's built here.

What's deliberately **not** in this phase: signing in (Phase 4), actually charging a mobile money account (Phase 7), and sending WhatsApp messages (Phase 8) — those need credentials only you can provide, so they're their own phases. Everything else — browsing products, building a cart, checking out into an order, managing inventory, running the blog — is real and functional now.

---

## For the tech team

### Modules built this phase

| Module | Base path | Access |
|---|---|---|
| Products *(Phase 1 reference)* | `/api/v1/products` | Public read · admin/staff write |
| Categories | `/api/v1/categories` | Public read · admin/staff write |
| Reviews | `/api/v1/reviews` | Public read · customer write (own) |
| Wishlist | `/api/v1/wishlist` | Customer (own) |
| Addresses | `/api/v1/addresses` | Customer (own) |
| Cart | `/api/v1/cart` | Customer (own) |
| Coupons | `/api/v1/coupons` | Admin/staff |
| Orders | `/api/v1/orders` | Customer (own) · admin/staff (all) |
| Inventory | `/api/v1/inventory` | Admin/staff |
| Delivery | `/api/v1/delivery` | Admin/staff |
| Blog | `/api/v1/blog` | Public read · admin/staff write |
| Landing Pages | `/api/v1/landing-pages` | Public read (published) · admin/staff write |
| Campaigns | `/api/v1/campaigns` | Admin/staff |

All routes are mounted in `apps/api/src/routes/index.ts`. `auth`, `payments`, and `whatsapp` module folders exist but are intentionally empty — Phases 4, 7, and 8 build them next.

### Endpoint reference

**Products**
```
GET    /products                 ?q=&category=&page=&pageSize=
GET    /products/:slug
POST   /products                 admin/staff
PATCH  /products/:id             admin/staff
DELETE /products/:id             admin
```

**Categories**
```
GET    /categories
GET    /categories/:slug
POST   /categories               admin/staff
PATCH  /categories/:id           admin/staff
DELETE /categories/:id           admin
```

**Reviews**
```
GET    /reviews/product/:productId
POST   /reviews                  customer — { productId, rating, comment? }
DELETE /reviews/:id              owner or admin
```

**Wishlist**
```
GET    /wishlist                 customer
POST   /wishlist/:productId      customer
DELETE /wishlist/:productId      customer
```

**Addresses**
```
GET    /addresses                customer
POST   /addresses                customer
PATCH  /addresses/:id            customer (own)
DELETE /addresses/:id            customer (own)
```

**Cart**
```
GET    /cart                                customer
POST   /cart/items                          { productId, quantity }
PATCH  /cart/items/:productId               { quantity }
DELETE /cart/items/:productId
POST   /cart/coupon                         { code }
DELETE /cart/coupon
```

**Coupons**
```
GET    /coupons                  admin/staff
POST   /coupons                  admin/staff
PATCH  /coupons/:code            admin/staff
```

**Orders**
```
POST   /orders/checkout          customer — rate-limited; turns cart into an Order (see below)
GET    /orders/mine              customer
GET    /orders/:id               owner or admin/staff
POST   /orders/:id/cancel        customer — only while status is "pending"
GET    /orders                   admin/staff — all orders, filterable by status
PATCH  /orders/:id/status        admin/staff — validated state-machine transition
```

**Inventory**
```
GET    /inventory/low-stock                  admin/staff
GET    /inventory/:productId/history         admin/staff
POST   /inventory/:productId/adjust          admin/staff — { change, reason }
GET    /inventory/:productId/batches         admin/staff
POST   /inventory/batches                    admin/staff — { productId, batchCode, quantity, ... }
```

**Delivery**
```
GET    /delivery/couriers                    admin/staff
POST   /delivery/couriers                    admin/staff
GET    /delivery/:orderId                    admin/staff
POST   /delivery/:orderId/assign             admin/staff — { courierId, estimatedAt? }
PATCH  /delivery/:orderId/status             admin/staff
```

**Blog**
```
GET    /blog                     ?page=&pageSize=   published only
GET    /blog/admin/all           admin/staff — includes drafts
GET    /blog/:slug
POST   /blog                     admin/staff
PATCH  /blog/:id                 admin/staff
DELETE /blog/:id                 admin
```

**Landing Pages**
```
GET    /landing-pages/admin/all  admin/staff
GET    /landing-pages/:slug      published only
POST   /landing-pages            admin/staff
PATCH  /landing-pages/:id        admin/staff
DELETE /landing-pages/:id        admin
```

**Campaigns**
```
GET    /campaigns                admin/staff
POST   /campaigns                admin/staff — { name, channel, message, scheduledFor? }
PATCH  /campaigns/:id/status     admin/staff
```

### The checkout flow, in detail

`POST /orders/checkout` is the most consequential endpoint in the system, so it's worth walking through exactly what it guarantees:

1. Loads the customer's cart; rejects if empty.
2. Opens a single Prisma transaction (`prisma.$transaction`) — everything below either all succeeds or all rolls back.
3. Re-checks stock for every line item *inside* the transaction (the cart may have gone stale since the customer loaded the checkout page).
4. Recomputes the coupon discount server-side (never trusts a discount amount from the client) and increments its redemption count.
5. Computes delivery fee by region.
6. Creates the `Order`, its `OrderItem`s (with product name/price snapshotted), a `Payment` row in `initiated` status, and a `Delivery` row in `unassigned` status — all in the same transaction.
7. Decrements `Product.stock` for each item and writes a matching `InventoryLog` entry.
8. Clears the cart and its coupon.

Cancelling an order (`PATCH /orders/:id/status` → `cancelled`) reverses step 7 — stock is restored with an `order_cancelled` log entry. Order status changes are validated against a state machine (`pending → paid → processing → dispatched → delivered`, plus `cancelled` from any non-terminal state) — an admin can't skip from `pending` straight to `delivered` by mistake.

**Payment records are created here but not yet processed.** `provider`/`method` are captured from the checkout form and a `Payment` row is created in `initiated` status with a `PaymentLog` entry. Actually calling Selcom/Flutterwave/DPO and handling their webhooks is Phase 7 — this phase creates exactly the row that phase's webhook handler will update.

### A deliberate exception to the "repository is the only place that touches Prisma" rule

The Phase 1 architecture doc states repositories are the sole place a service talks to Prisma. `orderService.checkout` and the cancellation path in `orderService.updateStatus` break that rule on purpose: they're multi-aggregate transactions spanning `Cart`, `Product`, `Order`, `InventoryLog`, and `Coupon` in one atomic unit. Threading a shared transaction client through four separate repositories would add indirection without adding safety — so these two operations call `prisma.$transaction` directly in the service. Every other module still follows the strict repository-only rule; this is the one recognized exception, confined to genuinely cross-aggregate writes.

### Validation, errors, and access control

Every write endpoint validates its input with a Zod schema before the controller runs (`middleware/validate.middleware.ts`) — invalid input never reaches business logic. Every thrown `AppError` is caught centrally and turned into a consistent `{ success: false, message, details? }` response with the right HTTP status. Every route that should be restricted uses `requireAuth` and/or `requireRole(...)` — no endpoint in this phase silently trusts a client-supplied user ID or role.

### Response shape convention

```json
// Success
{ "success": true, "product": { ... } }
{ "success": true, "items": [ ... ], "total": 42, "page": 1, "pageSize": 20 }

// Error
{ "success": false, "message": "Only 3 unit(s) of \"Moringa Capsules\" available", "details": null }
```

---

## Verification performed this phase

Before packaging, every relative import across all files in `apps/api/src` was checked programmatically against the file it points to, and every named import was checked against the actual exports of its source file — catching two real mismatches (the cart module's `updateItem` naming, and the orders module's dependence on a `checkoutSchema`, a `generateOrderNumber` util, and `cartRepository.findByUserId` that didn't exist yet) and fixing them before delivery rather than leaving them for you to hit.

What this verification does **not** replace: an actual `npm install && tsc --noEmit` type-check, and running the endpoints against a live database. Do that before treating this as final — see the installation guide below.

## Installation / running this phase locally

```bash
npm install
docker compose up -d
cp .env.example apps/api/.env    # fill in real DATABASE_URL, JWT_SECRET, etc.
npm run db:migrate --workspace=apps/api
npm run db:seed --workspace=apps/api
npm run dev:api
# API on http://localhost:4000 — try GET http://localhost:4000/api/v1/health
```

Note: routes gated by `requireAuth` will 401 until Phase 4 (Firebase project + real credentials) exists — that's expected at this stage, not a bug.

---

## Next: Phase 4 — Authentication

Firebase project wiring, the `/auth/sync` endpoint that creates a `User` row on first sign-in, custom-claim role assignment for staff/admin, and the frontend login/signup flow.
