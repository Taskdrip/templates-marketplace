import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "/api";
function getToken() { return localStorage.getItem("cm_token"); }

async function authFetch(path: string, method = "GET", body?: object) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export interface HireRequest {
  id: number;
  userId: number;
  title: string;
  description: string;
  appType: string;
  blockchainType: string;
  features: string | null;
  budgetMin: string | null;
  budgetMax: string | null;
  timeline: string | null;
  status: string;
  adminNotes: string | null;
  contactWhatsapp: string | null;
  contactTelegram: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitHireRequest {
  title: string;
  description: string;
  appType: string;
  blockchainType: string;
  features?: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline?: string;
  contactWhatsapp?: string;
  contactTelegram?: string;
}

export function useHireRequests() {
  return useQuery<HireRequest[]>({
    queryKey: ["hire-requests"],
    queryFn: () => authFetch("/hire-requests"),
  });
}

export function useAdminHireRequests() {
  return useQuery<HireRequest[]>({
    queryKey: ["admin-hire-requests"],
    queryFn: () => authFetch("/admin/hire-requests"),
  });
}

export function useSubmitHireRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitHireRequest) => authFetch("/hire-requests", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hire-requests"] });
    },
  });
}

export function useUpdateHireRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: number; status: string; adminNotes?: string }) =>
      authFetch(`/admin/hire-requests/${id}`, "PATCH", { status, adminNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hire-requests"] });
    },
  });
}
