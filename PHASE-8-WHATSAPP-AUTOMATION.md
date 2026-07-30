# Phase 8 — WhatsApp Automation
**PJHerbal Clinic · Segerea Branch**

Status: ⚠️ Code complete, **not live-verified** — same honest caveat as Phase 7. No live WhatsApp Business account is connected to this environment.

---

## For the customer

Customers now get WhatsApp messages automatically at the moments that matter: right after placing an order, again once payment is confirmed, and again whenever their delivery status changes — all without anyone on staff having to type a message. If someone leaves items in their cart and wanders off, they get a gentle reminder a couple of hours later. If a customer messages the business number directly, they get an instant acknowledgment instead of silence. And in the admin dashboard, staff can now actually broadcast a WhatsApp campaign to customers with one click — Phase 6 built the campaign records; this phase makes "Send" a real button.

---

## For the tech team

### What this phase built

```
modules/whatsapp/
├── whatsapp.client.ts      Thin wrapper around Meta's WhatsApp Cloud API (sendTemplate, sendText)
├── whatsapp.repository.ts  WhatsAppMessage logging, abandoned-cart query, broadcast recipient list
├── whatsapp.service.ts     sendOrderConfirmation, sendPaymentConfirmed, sendDeliveryUpdate,
│                           sendAbandonedCartReminders, dispatchCampaign, handleInboundMessage
├── whatsapp.controller.ts  Webhook verification + receipt, campaign send, ad-hoc broadcast
└── whatsapp.routes.ts

scripts/send-abandoned-cart-reminders.ts   Standalone cron-invoked job (see below)
```

```
GET  /whatsapp/webhook                  Meta's one-time verification handshake
POST /whatsapp/webhook                  Inbound message receiver (public, no auth — verified by Meta's own handshake)
POST /whatsapp/campaigns/:id/send       admin/staff — dispatches a saved campaign, marks it "sent"
POST /whatsapp/broadcast                admin only — ad-hoc broadcast without a saved campaign
```

### Three real trigger points wired this phase

WhatsApp notifications don't fire themselves — they had to be connected into the flows that already existed:

- **`orders/order.service.ts checkout()`** now calls `sendOrderConfirmation` right after the database transaction commits — deliberately *outside* the transaction, since an external API call must never hold a database transaction open.
- **`payments/payment.service.ts`** now calls `sendPaymentConfirmed` in all three success paths (Selcom webhook, Flutterwave webhook, DPO poll) — right after `markOrderPaid`, only on genuine success.
- **`delivery/delivery.service.ts updateStatus()`** now calls `sendDeliveryUpdate` after every status change an admin makes (Phase 6's delivery page).

Every one of these calls is wrapped in its own try/catch **inside** `whatsapp.service.ts` — a WhatsApp send failure is logged to `WhatsAppMessage` and never allowed to fail the checkout, payment, or delivery-update it's attached to. A customer's order must succeed even if Meta's API is briefly down.

### The abandoned-cart job — and why it's a script, not a timer

The natural first instinct is a `setInterval` inside the API's `server.ts`. That's deliberately **not** what this is: an in-process timer resets on every deploy or restart, and the moment you run more than one API instance for uptime (which any real deployment should), every instance fires its own timer and customers get duplicate reminders. Instead, `scripts/send-abandoned-cart-reminders.ts` is a standalone script meant to be triggered by something outside the app process — a system crontab entry, a Render/Railway "Cron Job" resource, or a scheduled GitHub Action:

```bash
npm run job:abandoned-carts --workspace=apps/api
```

It's safe to run as often as you like — `Cart.reminderSentAt` (from Phase 2's schema) makes it idempotent, so a cart is never reminded twice even if the job overlaps itself.

### WhatsApp's own rules this integration respects

Meta enforces a real constraint that shows up directly in `whatsapp.client.ts`: **outbound-initiated** messages (order confirmations, delivery updates, cart reminders) must use a pre-approved message **template**, not free text — WhatsApp will reject a plain text message sent outside the 24-hour window since the customer last messaged you. `sendTemplate` is used for every one of those; `sendText` is reserved for replying to an inbound message, where free text is allowed. The template *names* used (`order_confirmation`, `payment_confirmed`, `delivery_update`, `abandoned_cart_reminder`) are what you'll register in Meta Business Manager — the exact approved wording is yours to write, this code just fills in the variable slots.

### The honest gap: campaign targeting

`PromoCampaign` (Phase 2's schema) has no audience/segment field — `dispatchCampaign` broadcasts to every customer with a phone number on file. That's a real, working MVP, not a stub, but it's also genuinely all it does: there's no way yet to target "customers who bought Category X" or "customers inactive 30+ days." If campaign segmentation matters soon, that's a schema addition (a `targetSegment` or saved-filter field) worth planning for rather than a surprise later.

### Verification performed this phase

Same automated check as every prior phase — every relative and aliased import across the full stack was checked against real exports (zero mismatches), plus a manual cross-module dependency graph to rule out circular imports (`payments`/`orders`/`delivery` all import `whatsapp`; `whatsapp` imports `campaigns`; nothing imports back — no cycles). Two real gaps were caught and fixed before packaging: the WhatsApp route wasn't actually mounted in `routes/index.ts` despite the module existing, and the abandoned-cart cron job referenced in a code comment ("registered in server.ts") didn't actually exist anywhere — it's now a real, documented script.

What this doesn't replace: a live WhatsApp Business Account, approved message templates in Meta Business Manager, and an actual webhook registered against a public URL — none of which can be exercised from this environment.

---

## Next: Phase 9 — SEO

SEO-friendly URLs (already true — slugs, not IDs, throughout), meta tags and Open Graph data per page, schema.org structured data for products, a generated sitemap, and robots.txt — the parts of the SRS that are genuinely checkable without live infrastructure.
