# Phase 7 — Payments
**PJHerbal Clinic · Segerea Branch**

Status: ⚠️ Code complete, **not live-verified** — this is the one phase that genuinely cannot be tested without your real merchant credentials. Read this whole document before trusting it with real money.

---

## For the customer

When a customer places an order, they're now actually handed off to a real payment provider — Selcom for mobile money (M-Pesa, Tigo Pesa, Airtel Money, HaloPesa), Flutterwave for bank transfers (CRDB, NMB), matching what they picked at checkout. Once they pay, the provider notifies our server directly (a "webhook"), and the order automatically flips to "paid" — no manual step, no waiting for someone to check a bank statement. If the connection to the provider fails momentarily, the order isn't lost — the customer lands on a "payment still needed" screen with a retry button instead of a dead end.

---

## For the tech team — read this part carefully

### The honesty section, up front

Every other phase in this build could be checked against something concrete — a schema, an existing endpoint, an import graph. Payments can't be, not fully: there's no live Selcom/Flutterwave/DPO sandbox account connected to this environment, and no network access to test against one even if there were. What follows is built as carefully as possible against each provider's *published* API conventions, with real signature verification, real idempotency handling, and real error paths — but the exact field names, header names, and response shapes **must be confirmed against your actual merchant dashboards and sandbox environments before this touches real money**. Treat this as a strong, security-conscious first draft of the integration, not a verified-working one.

### What's real regardless of provider-specific details

These parts don't depend on getting Selcom/Flutterwave's exact API shape right, and are the parts most worth trusting as-is:

- **Payment rows already exist before this phase.** Checkout (Phase 3) creates a `Payment` row in `initiated` status at order time — this phase doesn't create payments, it drives the one that's already there through to `successful` or `failed`.
- **Every webhook is signature-verified before anything in it is trusted.** Selcom: HMAC-SHA256 digest, constant-time comparison (`crypto.timingSafeEqual`, not `===`, which is timing-attack-safe). Flutterwave: shared-secret header match. An unverifiable webhook is rejected with 401 and never reaches order-mutation logic.
- **Flutterwave payments are re-verified server-to-server, never trusted from the webhook body alone** — `verifyTransaction` re-fetches the transaction from Flutterwave's API and checks amount + currency match before marking anything paid. This is Flutterwave's own documented recommendation.
- **Every webhook handler is idempotent.** Payment providers retry webhook delivery aggressively; if a payment is already `successful`, a duplicate webhook is logged and ignored rather than double-processed. The `markOrderPaid` database write uses a conditional `updateMany` (only flips `pending → paid`), so even a race between two webhook deliveries can't double-apply the transition.
- **Every webhook and provider interaction is logged to `PaymentLog`** (the audit trail from Phase 2) — `provider_initiated`, `webhook_received`, `retry_requested`, with the raw payload attached. If a payment ever looks wrong, the log has the full history.
- **The retry flow has a ceiling** (`MAX_RETRIES = 3`) and requires the requesting user to own the order — the frontend order-success page surfaces a "Try payment again" button when initiation fails, so a failed provider call doesn't strand an order.

### What needs your verification before go-live, provider by provider

**Selcom** (`providers/selcom.ts`) — the digest signing recipe (which fields get concatenated, in what order, with what separator) is implemented per Selcom's published gateway spec, but Selcom's docs have historically had gaps between what's published and what their sandbox actually expects. Test the full `createCheckout` → redirect → webhook loop against Selcom's sandbox before launch, and watch the `PaymentLog` entries to see exactly what they send back.

**Flutterwave** (`providers/flutterwave.ts`) — this one is the most likely to work close to as-written; Flutterwave's v3 Standard Payments API is well-documented and stable. Still confirm the `verif-hash` header name and the exact webhook event shape against your dashboard's webhook settings.

**DPO** (`providers/dpo.ts`) — structurally different from the other two (XML, not JSON) and has no push-webhook signing scheme in the same sense. This implementation polls `verifyToken` when the customer returns from DPO's hosted page (`POST /payments/:orderId/confirm-dpo`) rather than trusting a webhook — call that endpoint from the frontend's redirect-return handler once you've confirmed DPO's actual redirect URL parameters.

### Endpoints added this phase

```
POST /payments/:orderId/initiate       customer (own order) — returns { redirectUrl }
POST /payments/:orderId/retry          customer (own order) — max 3 attempts
POST /payments/:orderId/confirm-dpo    customer (own order) — polls DPO's verifyToken
POST /payments/webhook/selcom          public — signature-verified
POST /payments/webhook/flutterwave     public — signature-verified
```

### Frontend changes this phase

Checkout no longer goes straight from "place order" to the confirmation page — it now calls `/payments/:orderId/initiate` immediately after order creation and redirects the browser to the provider's hosted checkout page. If that call fails, the customer still lands on `/order-success` (the order is real and saved) but sees a "payment still needed" state with a retry button, instead of either losing the order or being stuck.

---

## Next: Phase 8 — WhatsApp Automation

Order confirmations, delivery-status updates, and abandoned-cart reminders sent via the WhatsApp Cloud API — using the `WhatsAppMessage` log table and the `Cart.reminderSentAt` field Phase 2 already built for exactly this.
