import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import {
  fetchEnterprises,
  fetchEnterpriseById,
  createEnterprise,
  updateEnterprise,
  deleteEnterprise,
  bulkDeleteEnterprises,
} from "./enterprise.service";
import { EnterpriseCreateData, EnterpriseUpdateData } from "./enterprise.type";

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
    queryFn: fetchEnterprises,
  });
}

export function useEnterprise(id: string) {
  return useQuery({
    queryKey: enterpriseKeys.detail(id),
    queryFn: () => fetchEnterpriseById(id),
    enabled: !!id,
  });
}

export function useCreateEnterprise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEnterprise,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: enterpriseKeys.lists() }),
    meta: { toast: { success: "Enterprises.success.create", error: "Enterprises.error.create" } },
  });
}

export function useUpdateEnterprise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EnterpriseUpdateData }) =>
      updateEnterprise(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.lists() });
    },
    meta: { toast: { success: "Enterprises.success.update", error: "Enterprises.error.update" } },
  });
}

export function useDeleteEnterprise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEnterprise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.details() });
    },
    meta: { toast: { success: "Enterprises.success.delete", error: "Enterprises.error.delete" } },
  });
}

export function useBulkDeleteEnterprises() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteEnterprises,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.details() });
    },
    meta: {
      toast: { success: "Enterprises.success.bulkDelete", error: "Enterprises.error.bulkDelete" },
    },
  });
}
