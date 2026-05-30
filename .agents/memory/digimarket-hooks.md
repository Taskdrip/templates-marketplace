---
name: DigiMarket custom hooks
description: Custom React Query hooks for features not covered by the generated API client.
---

## useSettings / useUpdateSettings

Located at `artifacts/marketplace/src/hooks/useSettings.ts`.

**Why:** The site settings endpoint (`GET/PATCH /api/settings`) was added after the OpenAPI spec was locked. Rather than regenerating, a custom hook fetches it directly.

**How to apply:** Import from `@/hooks/useSettings` — NOT from `@workspace/api-client-react`. Any new route that isn't in `lib/api-spec/openapi.yaml` should follow the same pattern.

## Routes with no OpenAPI spec entry

- `GET/PATCH /api/settings` — site settings (telegram link, thank you message, payment instructions)
- `GET/POST/PATCH/DELETE /api/blog` and `/api/blog/all` — blog posts (admin only for write)
- `POST /api/admin/push-notification` — broadcast in-app notification to all users
- `POST /api/messages/start` — start or find escrow conversation by orderId

These all use `localStorage.getItem("cm_token")` as bearer token via direct fetch.
