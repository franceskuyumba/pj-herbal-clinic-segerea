# Deployment Guide
**PJHerbal Clinic · Segerea Branch**

Two deployment paths are documented here — pick one, don't mix them:

1. **Managed platforms (recommended)** — Vercel + Render/Railway. Less ops work, automatic SSL, automatic deploy-on-push, no server to patch.
2. **Self-hosted Docker** — `docker-compose.prod.yml`, for a VPS or any platform that runs docker-compose directly. More control, more responsibility.

---

## Path 1 — Managed platforms (recommended)

### 1. Database + Redis

Use a managed Postgres and Redis rather than self-hosting either — Render, Railway, and Supabase (Postgres only) all offer this with automatic backups.

1. Create a Postgres instance. Copy its connection string → this is your production `DATABASE_URL`.
2. Create a Redis instance. Copy its connection string → `REDIS_URL`.

### 2. Backend — Render (or Railway) Web Service

1. Connect your Git repo, set the service root to `apps/api`.
2. Build command: `npm install && npm run build --workspace=packages/shared-types && npm run build --workspace=apps/api`
3. Start command: `npx prisma migrate deploy --schema=prisma/schema.prisma && npm start`
4. Set every environment variable from `.env.example`'s API section (see the checklist below) — **real values, not placeholders**, especially `JWT_SECRET`/`COOKIE_SECRET` (generate with `openssl rand -base64 32`, don't reuse the dev placeholder).
5. Note the deployed URL (e.g. `https://pjherbal-api.onrender.com`) — you'll need it for step 3 and for every payment/WhatsApp webhook URL.

### 3. Frontend — Vercel

1. Import the repo into Vercel, set the project root to `apps/web`.
2. Vercel auto-detects Next.js — no custom build command needed beyond what's already in `apps/web/package.json`.
3. Set every `NEXT_PUBLIC_*` environment variable from `.env.example`'s web section. **These are baked in at build time** — if you add or change one after the first deploy, you must redeploy (not just restart) for it to take effect.
4. Set `NEXT_PUBLIC_API_URL` to the Render URL from step 2.
5. Attach your custom domain in Vercel's dashboard; Vercel provisions SSL automatically.

### 4. Point your domain

- Root domain / `www` → Vercel (frontend)
- `api.yourdomain.com` → Render (backend) — set this as a custom domain on the Render service, then use `https://api.yourdomain.com` as `NEXT_PUBLIC_API_URL` and `API_URL` instead of the `.onrender.com` URL, so webhook URLs given to payment providers don't depend on Render's default subdomain.

---

## Path 2 — Self-hosted Docker

```bash
cp .env.example .env.production
# edit .env.production with real values

docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

This runs Postgres, Redis, the API, and the web app as four containers on one host. You are responsible for: a reverse proxy (Caddy or nginx) in front of both services for SSL termination and routing your domain to the right container, backups of the `pjherbal_pgdata` volume, and OS/Docker security patching. This path trades Vercel/Render's automatic handling of all of that for full control — pick it deliberately, not by default.

---

## Environment variable checklist

Every variable below is already documented with a placeholder in `.env.example` — this table is just "which service needs it," since that's easy to get wrong across two separate deployments.

| Variable | Needed by | Notes |
|---|---|---|
| `DATABASE_URL`, `REDIS_URL` | API only | Never exposed to the frontend |
| `FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY` | API only | Service account — keep secret |
| `NEXT_PUBLIC_FIREBASE_*` | Web only | Public client config — safe to expose |
| `JWT_SECRET`, `COOKIE_SECRET` | API only | Generate fresh for production, never reuse dev values |
| `SELCOM_*`, `FLUTTERWAVE_*`, `DPO_*` | API only | Real merchant credentials from each provider's dashboard |
| `WHATSAPP_*` | API only | From Meta Business Manager, once your WhatsApp Business Account is approved |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | Web only | Optional — each pixel silently no-ops if unset (Phase 9) |
| `CORS_ALLOWED_ORIGINS` | API only | Must include your production frontend URL or every browser request will be blocked |
| `NEXT_PUBLIC_APP_URL` | Web + used in `lib/seo.ts` | Your real production domain — used to build canonical URLs, sitemap, OG tags |

## After every deploy: webhook URLs

Payment and WhatsApp webhooks are configured in each provider's own dashboard, not in this codebase — after your first production deploy, go set:

- Selcom merchant dashboard → webhook URL → `https://api.yourdomain.com/api/v1/payments/webhook/selcom`
- Flutterwave dashboard → webhook URL → `https://api.yourdomain.com/api/v1/payments/webhook/flutterwave`
- Meta Business Manager (WhatsApp) → webhook URL → `https://api.yourdomain.com/api/v1/whatsapp/webhook`, verify token matching `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

These cannot point at `localhost` — this is the step most likely to be forgotten and cause "payments/WhatsApp worked in dev, silent in production."

## Post-deploy smoke test

Run through this by hand after every production deploy, before announcing it:

1. Homepage loads, categories and products render (`GET /api/v1/products` reachable from the deployed frontend)
2. Sign up a test account, confirm `/auth/sync` creates a user row
3. Add a product to cart, apply a coupon (create a test one via `/coupons` first), reach checkout
4. Place a real low-value order with a real payment method — confirm the webhook flips it to "paid" and a WhatsApp confirmation arrives
5. Admin dashboard: sign in as admin, confirm `/analytics/summary` shows the test order
6. `https://yourdomain.com/sitemap.xml` and `/robots.txt` both resolve

## CI

`.github/workflows/ci.yml` runs lint, typecheck, unit tests, and a build-check on every push/PR — it does not deploy. Vercel and Render both deploy automatically from a Git push via their own native integration once connected, which is simpler and less to maintain than a custom deploy workflow duplicating what they already do.
