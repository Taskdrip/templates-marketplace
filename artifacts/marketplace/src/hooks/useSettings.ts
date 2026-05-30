import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "/api";
function getToken() { return localStorage.getItem("cm_token"); }

export interface SiteSettings {
  telegram_link?: string;
  thank_you_message?: string;
  payment_instructions?: string;
  site_name?: string;
  support_email?: string;
  [key: string]: string | undefined;
}

async function fetchSettings(): Promise<SiteSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) return {};
  return res.json();
}

export function useSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: fetchSettings,
    staleTime: 60_000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<SiteSettings>) => {
      const res = await fetch(`${API_BASE}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });
}
