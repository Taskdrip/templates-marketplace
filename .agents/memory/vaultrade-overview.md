---
name: Vaultrade project overview
description: Full-stack crypto marketplace rebranded as Vaultrade.store
---

**Brand:** Vaultrade.store — digital asset marketplace (trading bots, scripts, DeFi tools)
**Payments:** USDT TRC20 / TON / BEP20 — manual TX confirmation by admin

**Stack:**
- pnpm monorepo, Node.js 24, TypeScript 5.9
- API: Express 5 + Socket.IO at `/ws/socket.io` (NOT `/ws`)
- DB: PostgreSQL + Drizzle ORM
- Frontend: React + Vite + TailwindCSS + shadcn/ui + TanStack Query + wouter
- API codegen: Orval from OpenAPI spec

**Auth:** JWT in localStorage as `cm_token`; roles: user / admin
**Seed accounts:** admin@cryptomarket.io / admin123, john@example.com / user123

**Key files:**
- `artifacts/marketplace/src/hooks/useSettings.ts` — custom settings hook (not in generated API)
- `artifacts/marketplace/src/hooks/useMutations.ts` — standalone mutation hooks (parallel to generated API)
- `artifacts/marketplace/src/components/VaultradeLogo.tsx` — exports VaultradeLogomark, VaultradeWordmark

**Branding done:** VaultradeLogo, favicon, Navbar, Footer, DashboardLayout, AdminLayout, About, Blog, Terms, Privacy pages, index.html meta tags.

**Why:** Rebranded from DigiMarket/CryptoMarket to Vaultrade.store across all UI.
