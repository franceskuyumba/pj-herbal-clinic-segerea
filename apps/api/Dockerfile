# ---------- Base ----------
FROM node:20-alpine AS base
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

# ---------- Dependencies ----------
FROM base AS deps
RUN npm install --workspace=apps/api --workspace=packages/shared-types --include-workspace-root

# ---------- Build ----------
FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY packages/shared-types packages/shared-types
COPY apps/api apps/api
RUN npm run build --workspace=apps/api
# Prisma client is generated against the schema at build time, baked into
# the image, so the container never needs `npx prisma generate` at boot.
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# ---------- Runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/prisma ./apps/api/prisma
COPY --from=build /repo/apps/api/package.json ./apps/api/package.json

EXPOSE 4000
# Run migrations, then start — safe to run on every boot since Prisma
# migrations are idempotent (already-applied migrations are skipped).
CMD ["sh", "-c", "npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma && node apps/api/dist/server.js"]
