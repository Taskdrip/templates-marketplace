import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "/api";
function getToken() { return localStorage.getItem("cm_token"); }

async function authFetch(path: string, method = "GET", body?: object) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export interface HireRequest {
  id: number; userId: number; title: string; description: string;
  appType: string; blockchainType: string; features: string | null;
  budgetMin: string | null; budgetMax: string | null; timeline: string | null;
  status: string; adminNotes: string | null;
  contactWhatsapp: string | null; contactTelegram: string | null;
  createdAt: string; updatedAt: string;
}

export interface HireMilestone {
  id: number; requestId: number; title: string; description: string | null;
  amountPi: string; orderIndex: number; status: string;
  paidTxHash: string | null; paidAt: string | null;
  releasedAt: string | null; createdAt: string;
}

export interface SubmitHireRequest {
  title: string; description: string; appType: string; blockchainType: string;
  features?: string; budgetMin?: number; budgetMax?: number; timeline?: string;
  contactWhatsapp?: string; contactTelegram?: string;
}

export function useHireRequests() {
  return useQuery<HireRequest[]>({ queryKey: ["hire-requests"], queryFn: () => authFetch("/hire-requests") });
}

export function useHireRequestMilestones(requestId: number) {
  return useQuery<HireMilestone[]>({
    queryKey: ["hire-milestones", requestId],
    queryFn: () => authFetch(`/hire-requests/${requestId}/milestones`),
    enabled: !!requestId,
  });
}

export function useAdminHireRequests() {
  return useQuery<HireRequest[]>({ queryKey: ["admin-hire-requests"], queryFn: () => authFetch("/admin/hire-requests") });
}

export function useAdminHireMilestones(requestId: number) {
  return useQuery<HireMilestone[]>({
    queryKey: ["admin-hire-milestones", requestId],
    queryFn: () => authFetch(`/admin/hire-requests/${requestId}/milestones`),
    enabled: !!requestId,
  });
}

export function useSubmitHireRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitHireRequest) => authFetch("/hire-requests", "POST", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hire-requests"] }),
  });
}

export function useUpdateHireRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: number; status: string; adminNotes?: string }) =>
      authFetch(`/admin/hire-requests/${id}`, "PATCH", { status, adminNotes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-hire-requests"] }),
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, ...data }: { requestId: number; title: string; description?: string; amountPi: number; orderIndex?: number }) =>
      authFetch(`/admin/hire-requests/${requestId}/milestones`, "POST", data),
    onSuccess: (_d, v) => queryClient.invalidateQueries({ queryKey: ["admin-hire-milestones", v.requestId] }),
  });
}

export function useReleaseMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, requestId }: { id: number; requestId: number }) =>
      authFetch(`/admin/hire-milestones/${id}/release`, "PATCH"),
    onSuccess: (_d, v) => queryClient.invalidateQueries({ queryKey: ["admin-hire-milestones", v.requestId] }),
  });
}

export function useActivateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, requestId }: { id: number; requestId: number }) =>
      authFetch(`/admin/hire-milestones/${id}/activate`, "PATCH"),
    onSuccess: (_d, v) => queryClient.invalidateQueries({ queryKey: ["admin-hire-milestones", v.requestId] }),
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, requestId }: { id: number; requestId: number }) =>
      authFetch(`/admin/hire-milestones/${id}`, "DELETE"),
    onSuccess: (_d, v) => queryClient.invalidateQueries({ queryKey: ["admin-hire-milestones", v.requestId] }),
  });
}

export function useSubmitMilestonePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, txHash }: { id: number; txHash: string; requestId: number }) =>
      authFetch(`/hire-milestones/${id}/pay`, "POST", { txHash }),
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ["hire-milestones", v.requestId] });
      queryClient.invalidateQueries({ queryKey: ["hire-requests"] });
    },
  });
}
