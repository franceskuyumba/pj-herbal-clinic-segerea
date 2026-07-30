"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface CampaignDTO {
  id: string;
  name: string;
  channel: "email" | "whatsapp";
  status: "draft" | "scheduled" | "sent" | "cancelled";
  message: string;
  scheduledFor: string | null;
  sentAt: string | null;
}

export function useAdminCampaigns() {
  const queryClient = useQueryClient();

  const campaignsQuery = useQuery({
    queryKey: ["admin", "campaigns"],
    queryFn: () => apiClient.get<{ success: true; campaigns: CampaignDTO[] }>("/campaigns"),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] });
  }

  const create = useMutation({
    mutationFn: (input: { name: string; channel: "email" | "whatsapp"; message: string; scheduledFor?: string }) =>
      apiClient.post("/campaigns", input),
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CampaignDTO["status"] }) =>
      apiClient.patch(`/campaigns/${id}/status`, { status }),
    onSuccess: invalidate,
  });

  // Only meaningful for channel: "whatsapp" — actually dispatches the
  // message to every customer with a phone on file via the WhatsApp
  // Cloud API (Phase 8), then marks the campaign "sent".
  const sendNow = useMutation({
    mutationFn: (id: string) => apiClient.post<{ success: true; targeted: number; sent: number }>(`/whatsapp/campaigns/${id}/send`, {}),
    onSuccess: invalidate,
  });

  return {
    campaigns: campaignsQuery.data?.campaigns ?? [],
    isLoading: campaignsQuery.isLoading,
    create,
    updateStatus,
    sendNow,
  };
}
