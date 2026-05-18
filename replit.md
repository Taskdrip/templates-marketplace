# CryptoMarket

A full-stack crypto digital marketplace SaaS platform (like CodeCanyon/Gumroad/Sellix) for buying and selling digital crypto products — trading bots, scripts, templates, DeFi tools, and more. Payments are accepted in USDT TRC20, USDT TON, and USDT BEP20.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000/8080)
- `pnpm --filter @workspace/marketplace run dev` — run the marketplace frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + Socket.IO (websocket path: `/ws/socket.io`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + TailwindCSS + shadcn/ui + TanStack Query + wouter

## Where things live

- `artifacts/api-server/src/routes/` — all Express route handlers
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth middleware (`requireAuth`, `requireAdmin`)
- `artifacts/api-server/src/lib/jwt.ts` — JWT sign/verify helpers
- `artifacts/marketplace/src/pages/public/` — public-facing pages (Home, Marketplace, Product Detail, etc.)
- `artifacts/marketplace/src/pages/dashboard/` — user dashboard pages
- `artifacts/marketplace/src/pages/admin/` — admin dashboard pages
- `artifacts/marketplace/src/contexts/AuthContext.tsx` — auth state and user context
- `lib/db/src/schema/` — all 12 Drizzle schema files
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for API)
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks

## Architecture decisions

- Contract-first API design: OpenAPI spec defines the API, Orval generates React Query hooks and Zod schemas
- JWT-based auth stored in localStorage, validated on every protected route
- Crypto payments are manual: user pays to a wallet address, submits TX hash/screenshot, admin confirms
- Socket.IO for real-time messaging (mounted at `/ws/socket.io`)
- All product files served as download URLs after order confirmation
- Admin confirmation flow for all orders (no auto-delivery)

## Product

- **Public**: Browse products by category, search, filter, product detail pages with previews/reviews
- **Auth**: JWT registration/login, role-based access (user/admin)
- **User Dashboard**: Orders, downloads, crypto wallet (submit payments), messages, notifications, wishlist, support tickets, profile
- **Admin Dashboard**: Analytics (Recharts), product approval, order management, user management, payment verification, wallet configuration, support messages, tickets
- **Payments**: USDT TRC20, USDT TON, USDT BEP20 — manual TX confirmation by admin
- **Real-time**: Socket.IO chat between users and admin

## Seed Data

- Admin: `admin@cryptomarket.io` / `admin123`
- User: `john@example.com` / `user123`
- 12 seeded products across 9 categories
- 3 wallet addresses (USDT TRC20, USDT TON, USDT BEP20)

## User preferences

- Dark premium theme (dark navy background, purple/blue accents, glassmorphism)

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec changes before building frontend
- DB schema changes: edit `lib/db/src/schema/`, then run `pnpm --filter @workspace/db run push`
- Socket.IO client path must be `/ws/socket.io` (not default `/socket.io`)
- `db.execute()` returns a result object, not an iterable — use `db.select()` for queries
- The API server `artifact.toml` lists paths `["/api", "/ws"]` for proper proxy routing

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
