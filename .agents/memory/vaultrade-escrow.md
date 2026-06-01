---
name: Vaultrade Escrow Flow
description: Order status transitions, seller routes, payment verification, and key SQL/auth facts for the Vaultrade.store project.
---

## Order Status Flow
pending → awaiting_confirmation → confirmed → delivered → funds_released

- `pending` — order created, payment not yet submitted
- `awaiting_confirmation` — buyer submitted TX hash, awaiting admin
- `confirmed` — admin verified payment; download accessible
- `delivered` — buyer clicked "Confirm Receipt" (POST /api/orders/:id/confirm-receipt)
- `funds_released` — admin released funds to seller (PATCH /api/orders/:id/status body: {status:"funds_released"})

## Seller Routes (non-spec, raw fetch)
- `GET /api/seller/products` — products where sellerId = req.userId
- `POST /api/seller/products` — create product
- `PATCH /api/seller/products/:id` — update product (must be own)
- `DELETE /api/seller/products/:id` — delete product
- `GET /api/seller/earnings` — orders for seller's products, 90/10 split

**Why:** Seller routes are not in the OpenAPI spec; frontend uses raw fetch with `cm_token`.

## Key SQL Fact
Use `inArray(ordersTable.productId, productIds)` from drizzle-orm — not raw `sql ANY()` template — for filtering orders by array of product IDs.

**Why:** `sql.join(...)` with `ANY()` causes a Drizzle query error in this version.

## Express Auth Prefix
All routes mounted at `/api` prefix in `artifacts/api-server/src/app.ts` → `app.use("/api", router)`.
Test endpoints as `/api/auth/login`, `/api/orders`, etc. (not bare paths).

## Payment Status
Payment status must be `"confirmed"` (not `"verified"`) to trigger order status update in payments.ts route.

## Seller Identity
`isSeller` is determined by querying the DB (`usersTable.isSeller`) — not stored in JWT.
JWT only stores `userId` and `role`.

## Seed Credentials
- Admin: `admin@digimarket.io` / `admin123`
- Buyer: `john@example.com` / `user123`
- Seller: `seller@example.com` / `seller123`
