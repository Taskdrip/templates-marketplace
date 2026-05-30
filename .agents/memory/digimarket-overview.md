---
name: DigiMarket Project Overview
description: Key architecture decisions, auth approach, and API patterns for the DigiMarket Web3 marketplace.
---

## Core Architecture
- Monorepo: `lib/db` (Drizzle/Postgres), `lib/api-client-react` (generated + custom), `artifacts/api-server` (Express), `artifacts/marketplace` (React/Vite/Wouter)
- Workflows: API Server on port 8080, CryptoMarket frontend on port 20787
- Seed: `pnpm --filter @workspace/scripts run seed` — clear tables first with TRUNCATE ... CASCADE if reseeding

## Auth
- `customFetch` must be exported from `lib/api-client-react/src/index.ts` — was NOT exported by default
- Register/Login use `customFetch` directly (not generated hooks) because the generated Zod schemas would strip extra fields like phone/telegram
- Login supports 3 methods: email, phone, or telegram handle (all with password)
- Users have: `displayName`, `phone`, `telegramHandle`, `isSeller`, `sellerBio` columns

**Why:** Generated API client Zod schemas strip unknown fields at runtime, so extra auth fields must bypass the hook layer.

## Categories (slug → name)
source-code-apps, templates, social-media-accounts, facebook-accounts, websites-domains, landing-pages, crypto-defi-tools, saas-apps, seo-marketing

## Payments
USDT TRC20 / BEP20 / TON — admin holds as escrow. 10% platform commission.

## Key Routes
- `/seller-register` — dedicated seller registration page
- `/marketplace?cat=<slug>` — category filter via URL param
- `/marketplace?search=<q>` — search via URL param
