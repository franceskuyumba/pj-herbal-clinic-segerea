"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Role } from "@pjherbal/shared-types";

export interface AdminUserDTO {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: Role;
  createdAt: string;
}

export function useAdminUsers() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiClient.get<{ success: true; items: AdminUserDTO[]; total: number }>("/auth/users"),
  });

  const setRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => apiClient.patch(`/auth/users/${id}/role`, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  return { users: usersQuery.data?.items ?? [], isLoading: usersQuery.isLoading, setRole };
}
