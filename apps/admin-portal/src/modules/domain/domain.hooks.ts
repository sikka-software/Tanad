import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import {
  createDomain,
  fetchDomainById,
  fetchDomains,
  updateDomain,
  duplicateDomain,
} from "@/modules/domain/domain.service";
import type { DomainCreateData, DomainUpdateData } from "@/modules/domain/domain.type";

export const domainKeys = {
  all: ["domains"] as const,
  lists: () => [...domainKeys.all, "list"] as const,
  list: (filters: any) => [...domainKeys.lists(), { filters }] as const,
  details: () => [...domainKeys.all, "detail"] as const,
  detail: (id: string) => [...domainKeys.details(), id] as const,
};

export function useDomains() {
  return useQuery({
    queryKey: domainKeys.lists(),
    queryFn: fetchDomains,
  });
}

export function useDomain(id: string) {
  return useQuery({
    queryKey: domainKeys.detail(id),
    queryFn: () => fetchDomainById(id),
    enabled: !!id,
  });
}

export function useCreateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newDomain: DomainCreateData) => createDomain(newDomain),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: domainKeys.lists() }),
    meta: { toast: { success: "Domains.success.create", error: "Domains.error.create" } },
  });
}

export function useUpdateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DomainUpdateData }) => updateDomain(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: domainKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
    },
    meta: { toast: { success: "Domains.success.update", error: "Domains.error.update" } },
  });
}

export function useDuplicateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateDomain(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: domainKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
    },
    meta: { toast: { success: "Domains.success.duplicate", error: "Domains.error.duplicate" } },
  });
}

export function useDeleteDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResourceById(`/api/resource/domains/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
      queryClient.removeQueries({ queryKey: domainKeys.detail(variables) });
    },
    meta: { toast: { success: "Domains.success.delete", error: "Domains.error.delete" } },
  });
}

export function useBulkDeleteDomains() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteResource("/api/resource/domains", ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: domainKeys.lists() }),
    meta: { toast: { success: "Domains.success.delete", error: "Domains.error.delete" } },
  });
}
