import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  createDomain,
  deleteDomain,
  fetchDomainById,
  fetchDomains,
  updateDomain,
  bulkDeleteDomains,
  duplicateDomain,
} from "@/modules/domain/domain.service";
import type { Domain, DomainCreateData, DomainUpdateData } from "@/modules/domain/domain.type";

// Query keys for domains
export const domainKeys = {
  all: ["domains"] as const,
  lists: () => [...domainKeys.all, "list"] as const,
  list: (filters: any) => [...domainKeys.lists(), { filters }] as const,
  details: () => [...domainKeys.all, "detail"] as const,
  detail: (id: string) => [...domainKeys.details(), id] as const,
};

// Hook to fetch all domains
export function useDomains() {
  return useQuery({
    queryKey: domainKeys.lists(),
    queryFn: fetchDomains,
  });
}

// Hook to fetch a single domain by ID
export function useDomain(id: string) {
  return useQuery({
    queryKey: domainKeys.detail(id),
    queryFn: () => fetchDomainById(id),
    enabled: !!id, // Only run query if id is truthy
  });
}

// Hook for creating a new domain
export function useCreateDomain() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: (newDomain: DomainCreateData) => {
      // Map user_id to user_id for the service function
      const { user_id, ...rest } = newDomain;
      const domainData: DomainCreateData = {
        ...rest,
        user_id: user_id,
      };
      return createDomain(domainData);
    },
    onSuccess: () => {
      // Invalidate the list query to refetch
      queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
      toast.success(t("General.successful_operation"), {
        description: t("Domains.success.create"),
      });
    },
  });
}

// Hook for updating an existing domain
export function useUpdateDomain() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DomainUpdateData }) => updateDomain(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: domainKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
      toast.success(t("General.successful_operation"), {
        description: t("Domains.success.update"),
      });
    },
  });
}

// Hook for duplicating a domain
export function useDuplicateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateDomain(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: domainKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
    },
  });
}

// Hook for deleting a domain
export function useDeleteDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDomain(id),
    onSuccess: (_, variables) => {
      // Invalidate the list and remove the specific detail query from cache
      queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
      queryClient.removeQueries({ queryKey: domainKeys.detail(variables) });
    },
  });
}

// Hook for bulk deleting domains
export function useBulkDeleteDomains() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteDomains,
    onSuccess: () => {
      // Invalidate the list query
      queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
    },
  });
}
