# ---------- Base ----------
FROM node:20-alpine AS base
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

# ---------- Dependencies ----------
FROM base AS deps
RUN npm install --workspace=apps/web --workspace=packages/shared-types --include-workspace-root

# ---------- Build ----------
FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY packages/shared-types packages/shared-types
COPY apps/web apps/web
# NEXT_PUBLIC_* values are baked into the client bundle at BUILD time, not
# read at container start — they must be passed as build args, one per
# variable, or the deployed site will silently ship with empty values.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_META_PIXEL_ID
ARG NEXT_PUBLIC_TIKTOK_PIXEL_ID
ARG NEXT_PUBLIC_APP_URL
RUN npm run build --workspace=apps/web

# ---------- Runtime ----------
# next.config.js has output:"standalone", so the build produces a
# self-contained server — no need to ship node_modules or the full source.
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
