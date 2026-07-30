# Testing Guide
**PJHerbal Clinic · Segerea Branch**

## Honest status, up front

Automated tests were added in this phase — they did not exist before. They cover the highest-risk pure logic (payment signature verification, checkout validation, delivery fee calculation) but **have not been executed** — this environment has no network access to run `npm install`, so there's no `node_modules` to actually run Vitest against. Every test was written carefully and traced by hand against the exact implementation it tests (matching signing algorithms byte-for-byte, checking exact schema field names), but "traced by hand" is not the same guarantee as "ran green in CI." Run them for real before trusting this document further:

```bash
npm install
npm run test --workspace=apps/api
npm run test --workspace=apps/web
```

## What's covered

### API (`apps/api/tests/unit/`)

| File | Covers |
|---|---|
| `payment-signatures.test.ts` | Selcom HMAC digest verification (valid, tampered, wrong secret, missing header) and Flutterwave shared-secret header check — the highest-security-value code in the whole system |
| `schemas.test.ts` | Every major Zod validation schema (checkout, products, cart, addresses, coupons) against valid and invalid input, including the Tanzanian phone regex |
| `delivery-fee.test.ts` | `computeDeliveryFee`'s Dar es Salaam vs. other-region logic, including case-insensitivity |
| `order-number.test.ts` | `generateOrderNumber`'s padding behavior |

### Web (`apps/web/tests/unit/`)

| File | Covers |
|---|---|
| `utils.test.ts` | `formatMoney` (currency display) and `cn` (Tailwind class merging) |
| `checkout-validator.test.ts` | The checkout form schema, and — importantly — that `PAYMENT_METHOD_PROVIDER` has an entry for every payment method in `PAYMENT_METHOD_LABELS`, so adding a new payment method to the UI without wiring its provider mapping fails a test instead of failing silently at checkout |

### Why these tests specifically

Every test here is a **pure function or validation schema** — no database, no network, no mocking framework required, which is also why they could be reasoned through carefully without execution. This was a deliberate choice over trying to unit-test the transaction-heavy service methods (checkout, webhook handling), which mix business logic with Prisma calls in ways that need either a real test database or heavy mocking to test meaningfully — see "What's not covered" below.

## What's NOT covered, and why that matters

**Integration and end-to-end tests do not exist.** Nothing here spins up a real (or test) database and exercises `orderService.checkout()`, `paymentService.handleSelcomWebhook()`, or the checkout flow through the actual API. That's the single biggest testing gap in this project, and it's the part that matters most — checkout is the one flow where a bug costs real money or a lost order. Two realistic paths to close this gap, in order of effort:

1. **Add a test database.** Spin up Postgres in CI (GitHub Actions supports this via a `services:` block), run migrations against it, and write integration tests that call the actual service functions and assert on real database state afterward. This is the standard approach and worth prioritizing over more unit tests.
2. **End-to-end tests against a running app** (Playwright or Cypress) — sign up, add to cart, checkout with a payment provider's sandbox mode, confirm the order appears in the admin dashboard. Higher-value but higher-effort; reasonable to add once the app is deployed somewhere Playwright can point at.

**Frontend component tests do not exist either** — nothing renders `<ProductCard>` or `<CheckoutPage>` and asserts on the output. Given the choice between component tests and the integration tests above, the integration tests protect more real money and are the better next investment.

## Running tests during development

```bash
# Single run
npm run test --workspace=apps/api
npm run test --workspace=apps/web

# Watch mode while writing code
npx vitest --workspace=apps/api
npx vitest --workspace=apps/web
```

## Adding a new test

Follow the existing pattern: one `describe` block per function/schema, one `it` per behavior (not per input) — group related valid/invalid cases with `it.each` where that reads more clearly than a wall of separate `it` blocks (see `payment-signatures.test.ts`'s phone number cases for the pattern). If a test needs environment variables that `config/env.ts` requires, set them in `tests/setup.ts` (shared across every test file) or in a `beforeAll` in the specific test file (if the variable is only relevant to that one feature, the way the Selcom/Flutterwave credentials are scoped to `payment-signatures.test.ts` alone).
