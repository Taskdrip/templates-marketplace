---
name: Vaultrade API client exports
description: What the generated api-client-react exports — all mutation hooks exist, only useGetSettings was missing
---

The generated `lib/api-client-react/src/generated/api.ts` exports ALL of the following mutation hooks (contrary to earlier session notes):
- useRegister, useLogin, useLogout
- useCreateProduct, useUpdateProduct, useDeleteProduct
- useCreateOrder, useUpdateOrderStatus
- useSubmitPayment, useVerifyPayment
- useCreateWallet, useUpdateWallet, useDeleteWallet
- useSendMessage, useStartConversation
- useMarkAllNotificationsRead, useMarkNotificationRead
- useAddFavorite, useRemoveFavorite
- useCreateTicket, useUpdateTicket
- useUpdateAdminUser, useDeleteAdminUser
- useApproveProduct, useCreateReview, useCreateCategory, etc.

Also exports `customFetch`, `setBaseUrl`, `setAuthTokenGetter` from custom-fetch module.

**The only truly missing export** was `useGetSettings` — it was never in the OpenAPI spec and was previously used in PushNotifications.tsx (now fixed to use `@/hooks/useSettings`).

`artifacts/marketplace/src/hooks/useMutations.ts` is a standalone parallel implementation of the mutation hooks using raw fetch. It coexists with the generated hooks without conflict.

**Why:** Session notes incorrectly assumed all mutation hooks were missing. They all exist. The real bug was only `useGetSettings`.

**How to apply:** When adding new pages that need mutations, prefer importing from `@workspace/api-client-react` directly (the generated hooks). Use `@/hooks/useMutations` only for hooks that genuinely don't exist in the generated client.
