# PJHerbal Clinic — Segerea Branch

Production e-commerce platform for nutritional supplements, built for the Tanzanian market. Next.js + Express + PostgreSQL/Prisma + Firebase Auth, with real Selcom/Flutterwave/DPO payment integration and WhatsApp automation.

Built in 10 phases, each documented in full — start with whichever is relevant to what you're doing:

| Phase | Document | Covers |
|---|---|---|
| 1 | [`PHASE-1-ARCHITECTURE.md`](./PHASE-1-ARCHITECTURE.md) | Monorepo structure, the module pattern every backend feature follows, installation |
| 2 | [`PHASE-2-DATABASE-SCHEMA.md`](./PHASE-2-DATABASE-SCHEMA.md) | The full Prisma data model, SRS traceability, design decisions |
| 3 | [`PHASE-3-API-DEVELOPMENT.md`](./PHASE-3-API-DEVELOPMENT.md) | Every endpoint, the checkout transaction in detail |
| 4 | [`PHASE-4-AUTHENTICATION.md`](./PHASE-4-AUTHENTICATION.md) | Firebase auth, role-based access, how to bootstrap your first admin |
| 5 | [`PHASE-5-FRONTEND.md`](./PHASE-5-FRONTEND.md) | Every customer-facing page, the design system |
| 6 | [`PHASE-6-ADMIN-DASHBOARD.md`](./PHASE-6-ADMIN-DASHBOARD.md) | Admin tooling, the analytics module |
| 7 | [`PHASE-7-PAYMENTS.md`](./PHASE-7-PAYMENTS.md) | Selcom/Flutterwave/DPO — **read the caveats before going live** |
| 8 | [`PHASE-8-WHATSAPP-AUTOMATION.md`](./PHASE-8-WHATSAPP-AUTOMATION.md) | Order/payment/delivery notifications, abandoned-cart reminders, campaigns |
| 9 | [`PHASE-9-SEO.md`](./PHASE-9-SEO.md) | Metadata, structured data, sitemap, analytics pixels |
| 10 | This document + [`DEPLOYMENT.md`](./DEPLOYMENT.md) + [`TESTING.md`](./TESTING.md) | Deployment, CI, tests |

## Quick start (local development)

```bash
npm install
docker compose up -d                    # Postgres + Redis
cp .env.example apps/api/.env           # fill in real values
cp .env.example apps/web/.env.local     # fill in real NEXT_PUBLIC_* values
npm run db:migrate --workspace=apps/api
npm run db:seed --workspace=apps/api
npm run dev
# web → http://localhost:3000
# api → http://localhost:4000/api/v1/health
```

## Project structure

```
pjherbal/
├── apps/
│   ├── web/            Next.js 14 (App Router), TypeScript, Tailwind, Framer Motion
│   └── api/             Express, TypeScript, Prisma — feature-module architecture
├── packages/
│   └── shared-types/   Types shared between web and api
├── .github/workflows/  CI (lint, typecheck, test, build-check)
├── docker-compose.yml       Local dev — Postgres + Redis only
├── docker-compose.prod.yml  Self-hosted production alternative to Vercel/Render
└── PHASE-*.md           One document per build phase — the real design record
```

## Before this goes live — the honest checklist

Every phase document is candid about what's genuinely verified versus what needs your hands-on confirmation before real customers and real money touch it. Consolidated here:

- [ ] **Run `npm install` and a real build.** Nothing in this codebase has been executed in a live Node environment — every check performed during the build was static (import resolution, schema cross-referencing, manual tracing). `tsc --noEmit` and `next build` are the first real compiler checks this code will get.
- [ ] **Run the test suite for real** (`TESTING.md`) — written and hand-verified, never executed.
- [ ] **Test Selcom, Flutterwave, and DPO against their real sandboxes** (`PHASE-7-PAYMENTS.md`) — built against published API docs, not verified against a live account.
- [ ] **Register WhatsApp message templates in Meta Business Manager** and test the webhook against a real WhatsApp Business Account (`PHASE-8-WHATSAPP-AUTOMATION.md`).
- [ ] **Get a real Firebase project running** (`PHASE-4-AUTHENTICATION.md`) and bootstrap your first admin account.
- [ ] **Replace the placeholder Privacy Policy and Terms of Service copy** (`apps/web/src/app/(customer)/privacy-policy` and `/terms`) with legally reviewed text.
- [ ] **Add a real `og-default.jpg`** (1200×630) referenced by `lib/seo.ts` — currently pointing at a file that doesn't exist yet.
- [ ] Set every webhook URL in every provider's dashboard to your real production domain (`DEPLOYMENT.md`).

## A note on how this was actually built

This project was built entirely inside a chat conversation, phase by phase, with real verification built into the process rather than assumed: every phase's code was checked against what earlier phases actually built (not what was assumed to exist), cross-module imports were checked programmatically rather than by inspection alone, and — a few times — code appeared in the workspace that didn't match what had actually been discussed or verified; when that happened, it was checked against the real schema and API before being trusted, and fixed or rewritten where it didn't hold up. That process is part of why each phase document includes an explicit "what was verified" section: the goal was for this README's checklist to be short and honest, not for every phase to quietly claim more certainty than it has earned.
