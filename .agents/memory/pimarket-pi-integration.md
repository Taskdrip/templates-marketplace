---
name: PiMarket Pi Network integration
description: Pi SDK setup, PiContext hooks, Pi auth backend route, payment flow, and UI currency display for the PiMarket rebrand.
---

## Pi SDK Loading
- SDK script tag in `artifacts/marketplace/index.html`: `<script src="https://sdk.minepi.com/pi-sdk.js">`
- Available as `window.Pi` in Pi Browser. In dev, SDK loads but postMessage to `app-cdn.minepi.com` fails (expected — not in real Pi Browser).
- `isInPiBrowser` detection: check `typeof window.Pi !== "undefined" && !!window.Pi.initialized` (or similar) — SDK only fully initializes in Pi Browser.

## PiContext (`artifacts/marketplace/src/contexts/PiContext.tsx`)
- Provides: `isInPiBrowser`, `piSdkReady`, `piUser`, `authenticateWithPi()`, `createPiPayment()`, `isAuthenticating`
- Wrap App with `<PiProvider>` (replaces old TonConnectUIProvider)
- `authenticateWithPi()` returns `{ uid, username, accessToken }` or null

## Pi Auth Backend (`/api/auth/pi-login`)
- Route in `artifacts/api-server/src/routes/auth.ts`
- Creates user with `email = "${piUid}@pi.network"` (no extra DB column needed)
- Stores Pi UID in `telegramHandle` column as secondary identifier
- Returns same JWT token format as email login

## Pi Payment Chain
- Chain ID: `"PI"` (replaces USDT_TRC20 / USDT_BEP20 / USDT_TON)
- Wallet in `walletsTable` with `chain = "PI"`
- Seed: `artifacts/scripts/src/seed.ts` — upsertWallet("PI", ...)
- Admin Wallets page CHAINS config: single entry `{ id: "PI", label: "Pi Network (π)", ... }`

## Currency Display Convention
- Always render: `<span className="text-yellow-400 font-black" style={{ fontFamily: "serif" }}>π</span>` for the π symbol
- Price format: `π{amount.toFixed(2)}` (no $ dollar sign anywhere)
- Product card badge: `π Pi` in yellow-400

## Checkout Flow (CryptoCheckoutModal)
- In Pi Browser: show "Pi Browser Pay" tab → `createPiPayment()` → SDK handles it → on completion call `/api/payments` with txid
- Outside Pi Browser: show wallet QR + manual TXID input fallback
- Payment expires after 30 minutes (countdown timer)

**Why:** Pi Network requires Pi Browser for native payments; fallback manual flow needed for web browsers.
