FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

# ── Install dependencies ───────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./
COPY lib/ lib/
COPY artifacts/api-server/ artifacts/api-server/
COPY artifacts/marketplace/ artifacts/marketplace/
COPY scripts/ scripts/
# Install all workspace deps (needed for build)
RUN pnpm install --frozen-lockfile

# ── Build ──────────────────────────────────────────────────────────────────────
FROM deps AS builder
# Build frontend SPA
RUN pnpm --filter @workspace/marketplace run build
# Build API server (esbuild bundles everything)
RUN pnpm --filter @workspace/api-server run build

# ── Production image ───────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

# We only need: the bundled API, the built frontend, and native addons (bcrypt)
COPY --from=builder /app/artifacts/api-server/dist            ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/marketplace/dist/public    ./artifacts/marketplace/dist/public
# bcrypt is externalized by esbuild so we need its node_modules
COPY --from=builder /app/node_modules                         ./node_modules

# Persistent uploads directory (mount a Railway volume here)
RUN mkdir -p /data/uploads && \
    addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /data/uploads

USER appuser

ENV NODE_ENV=production
ENV PORT=8080
ENV UPLOADS_DIR=/data/uploads
ENV FRONTEND_DIST=/app/artifacts/marketplace/dist/public

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]
