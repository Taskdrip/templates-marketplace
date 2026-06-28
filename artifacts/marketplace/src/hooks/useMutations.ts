import { useMutation } from "@tanstack/react-query";

const API = "/api";
function token() { return localStorage.getItem("cm_token"); }

async function apiFetch(method: string, path: string, body?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || (err as any).message || `Request failed: ${res.status}`);
  }
  return res.json().catch(() => null);
}

export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status: string; adminNotes?: string } }) =>
      apiFetch("PATCH", `/orders/${id}/status`, data),
  });
}

export function useConfirmReceipt() {
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch("POST", `/orders/${id}/confirm-receipt`),
  });
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status: string } }) =>
      apiFetch("PATCH", `/payments/${id}/verify`, data),
  });
}

export function useSubmitPayment() {
  return useMutation({
    mutationFn: ({ data }: { data: { orderId: number; chain: string; txHash: string; amount: number } }) =>
      apiFetch("POST", "/payments/submit", data),
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: (vars: { conversationId?: number; data: { content: string; conversationId?: number } }) => {
      const convId = vars.conversationId ?? vars.data.conversationId;
      return apiFetch("POST", `/messages/${convId}`, { content: vars.data.content });
    },
  });
}

export function useStartConversation() {
  return useMutation({
    mutationFn: ({ data }: { data: { subject: string; orderId?: number } }) =>
      apiFetch("POST", "/messages/start", data),
  });
}

export function useMarkAllNotificationsRead() {
  return useMutation({
    mutationFn: () => apiFetch("PATCH", "/notifications/read-all"),
  });
}

export function useMarkNotificationRead() {
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch("PATCH", `/notifications/${id}/read`),
  });
}

export function useRemoveFavorite() {
  return useMutation({
    mutationFn: ({ productId }: { productId: number }) =>
      apiFetch("DELETE", `/favorites/${productId}`),
  });
}

export function useCreateTicket() {
  return useMutation({
    mutationFn: ({ data }: { data: { subject: string; description: string; priority?: string } }) =>
      apiFetch("POST", "/tickets", data),
  });
}

export function useUpdateTicket() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      apiFetch("PATCH", `/tickets/${id}`, data),
  });
}

export function useUpdateAdminUser() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      apiFetch("PATCH", `/admin/users/${id}`, data),
  });
}

export function useDeleteAdminUser() {
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch("DELETE", `/admin/users/${id}`),
  });
}

export function useCreateWallet() {
  return useMutation({
    mutationFn: ({ data }: { data: Record<string, unknown> }) =>
      apiFetch("POST", "/wallets", data),
  });
}

export function useUpdateWallet() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      apiFetch("PATCH", `/wallets/${id}`, data),
  });
}

export function useCreateProduct() {
  return useMutation({
    mutationFn: ({ data }: { data: Record<string, unknown> }) =>
      apiFetch("POST", "/products", data),
  });
}

export function useUpdateProduct() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      apiFetch("PATCH", `/products/${id}`, data),
  });
}

export function useDeleteProduct() {
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch("DELETE", `/products/${id}`),
  });
}

export function useSellerSubmitProduct() {
  return useMutation({
    mutationFn: ({ data }: { data: Record<string, unknown> }) =>
      apiFetch("POST", "/seller/products", data),
  });
}

export function useSellerUpdateProduct() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      apiFetch("PATCH", `/seller/products/${id}`, data),
  });
}

export function useSellerDeleteProduct() {
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch("DELETE", `/seller/products/${id}`),
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: ({ data }: { data: Record<string, unknown> }) =>
      apiFetch("PATCH", "/auth/profile", data),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ data }: { data: { currentPassword: string; newPassword: string } }) =>
      apiFetch("PATCH", "/auth/password", data),
  });
}

export function useReleaseFunds() {
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch("PATCH", `/orders/${id}/status`, { status: "funds_released" }),
  });
}
