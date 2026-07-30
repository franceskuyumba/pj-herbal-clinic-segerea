# Phase 1 — Project Architecture
**PJHerbal Clinic · Production E-Commerce Platform**

Status: ✅ Complete — ready for review before Phase 2 (Database Schema) begins.

---

## For the customer

The project is being built as two connected applications that talk to each other over a private API, instead of one single file:

- **The website** (what customers and admin staff see and click on)
- **The server** (what checks stock, processes orders, talks to payment providers, and keeps everything secure)

They're kept separate on purpose: the website can be updated, redesigned, or scaled independently from the order/payment/inventory logic, and the server can be secured and audited without touching anything customer-facing. This is the standard structure used by production e-commerce platforms, and it's what makes the "every feature must work / every API must be connected" requirement achievable.

Nothing customer-facing is built yet in this phase — this is the foundation the rest of the project is poured onto. Phase 2 (database) and Phase 3 (API) are next.

---

## For the tech team

### Monorepo layout

```
pjherbal/
├── apps/
│   ├── web/            Next.js 14 (App Router), TypeScript, Tailwind, Framer Motion
│   └── api/             Express, TypeScript, Prisma
├── packages/
│   ├── shared-types/   Types shared between web and api (single source of truth)
│   └── config/           Shared lint/tooling config
├── docker-compose.yml    Local Postgres + Redis
├── .env.example
├── package.json          npm workspaces root
└── tsconfig.base.json
```

npm workspaces (not a separate tool like Turborepo/Nx) was chosen to keep the tooling surface minimal for a team of this size — it can be upgraded to Turborepo later without restructuring folders if build times become a problem.

### apps/web — Next.js

```
apps/web/src/
├── app/
│   ├── (customer)/     Route group: shop, product/[slug], cart, checkout, blog, account
│   ├── (admin)/admin/  Route group: dashboard, products, orders, inventory, blog
│   └── layout.tsx
├── components/
│   ├── ui/              Reusable primitives (Button, Input, Modal, Card...)
│   ├── layout/           Header, Footer, AdminSidebar
│   ├── product/, cart/, forms/
├── lib/                  firebase.ts, api-client.ts, validators/
├── hooks/
├── store/                Zustand — cart state
└── types/
```

Route groups `(customer)` and `(admin)` share the Next.js routing tree but get separate layouts — the admin surface never ships customer-facing chrome (or vice versa) in the same bundle.

### apps/api — Express

Feature-module structure, not MVC-by-layer-across-the-whole-app — each module owns its full vertical slice:

```
apps/api/src/modules/<feature>/
├── <feature>.routes.ts       Express Router — wires middleware to controller
├── <feature>.controller.ts   HTTP only: req in, res out, no business logic
├── <feature>.service.ts      Business rules live here
├── <feature>.repository.ts   The ONLY file that calls Prisma directly
└── <feature>.schema.ts       Zod DTOs — request validation + inferred types
```

This is the SOLID/clean-architecture mapping the brief asked for:
- **Single Responsibility** — each layer has exactly one reason to change (routing, HTTP shape, business rule, or persistence).
- **Dependency Inversion** — services depend on the repository's function signatures, not on Prisma directly, so the persistence layer could be swapped without touching business logic.
- **Open/Closed** — new modules (orders, payments, blog, etc. in later phases) are added as new folders following this same shape, without modifying the shared middleware.

The `products` module is fully wired end-to-end in this phase as the reference implementation — routes → validation → controller → service → repository, with role-gated write access (`admin`/`staff` only) and public read access. Every module built in Phase 3 follows this exact shape.

### Cross-cutting concerns already wired

| Concern | Where |
|---|---|
| Environment validation (fail fast on missing config) | `apps/api/src/config/env.ts` (Zod) |
| Firebase token verification | `apps/api/src/config/firebase-admin.ts` + `middleware/auth.middleware.ts` |
| Role-based access | `requireRole("admin", "staff")` middleware, composable per-route |
| Request validation | `middleware/validate.middleware.ts` (Zod, applied per-route) |
| Centralized error handling | `middleware/error.middleware.ts` + `AppError` |
| Rate limiting | `middleware/rateLimit.middleware.ts` — general + tightened for sensitive routes |
| Security headers, CORS | `helmet`, `cors` in `app.ts` |
| Image optimization | `next.config.js` remote pattern + AVIF/WebP, Cloudinary planned as origin |

### Why Redis is in docker-compose already

Not used yet in Phase 1, but reserved for: rate-limit counters, cart/session caching, and pub/sub for WhatsApp automation triggers in Phase 8 — added now so the local dev environment doesn't need to change later.

### What's intentionally NOT in this phase

- No business logic beyond the `products` reference module
- No real Prisma data model (stub schema only — full model is Phase 2)
- No UI pages/components beyond the folder structure
- No live payment/WhatsApp/Firebase credentials (those are placeholders in `.env.example` — you provide the real values)

---

## Installation (development environment)

```bash
# 1. Install dependencies (from repo root)
npm install

# 2. Start Postgres + Redis
docker compose up -d

# 3. Configure environment
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
# then fill in real Firebase / Selcom / Flutterwave / WhatsApp values

# 4. Generate Prisma client (stub schema for now)
npm run db:generate --workspace=apps/api

# 5. Run both apps
npm run dev
# web  → http://localhost:3000
# api  → http://localhost:4000
```

---

## Next: Phase 2 — Database Schema

Full Prisma data model: `User`, `Product`, `Category`, `CartItem`, `Order`, `OrderItem`, `Payment`, `InventoryLog`, `BlogPost`, `Address`, plus all relations, indexes, and enums needed for every feature in the requirements list — with an ERD and migration plan.
