import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import { EnterpriseCreateData } from "../onboarding/onboarding.type";

export const enterpriseKeys = {
  all: ["enterprises"] as const,
  lists: () => [...enterpriseKeys.all, "list"] as const,
  list: (filters: any) => [...enterpriseKeys.lists(), { filters }] as const,
  details: () => [...enterpriseKeys.all, "detail"] as const,
  detail: (id: string) => [...enterpriseKeys.details(), id] as const,
};

export function useEnterprises() {
  return useQuery({
    queryKey: enterpriseKeys.lists(),
    queryFn: () => {
      // TODO: Implement fetchEnterprises
    },
  });
}

export function useEnterprise(id: string) {
  return useQuery({
    queryKey: enterpriseKeys.detail(id),
    queryFn: () => {
      // TODO: Implement fetchEnterpriseById
    },
    enabled: !!id,
  });
}

export function useCreateEnterprise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newEnterprise: EnterpriseCreateData) => {
      // TODO: Implement createEnterprise
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: enterpriseKeys.lists() }),
    meta: { toast: { success: "Enterprises.success.create", error: "Enterprises.error.create" } },
  });
}

export function useUpdateEnterprise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EnterpriseUpdateData }) => {
      // TODO: Implement updateEnterprise
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.lists() });
    },
    meta: { toast: { success: "Enterprises.success.update", error: "Enterprises.error.update" } },
  });
}
