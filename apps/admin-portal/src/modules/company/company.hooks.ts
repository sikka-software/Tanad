import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCompany,
  deleteCompany,
  bulkDeleteCompanies,
  fetchCompanyById,
  fetchCompanies,
  updateCompany,
  duplicateCompany,
} from "@/company/company.service";
import type { Company, CompanyCreateData, CompanyUpdateData } from "@/company/company.type";

import useCompanyStore from "./company.store";

export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (filters: any) => [...companyKeys.lists(), { filters }] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
};

export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.lists(),
    queryFn: fetchCompanies,
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => fetchCompanyById(id),
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  // const setData = useCompanyStore((state) => state.setData);
  return useMutation({
    mutationFn: (company: CompanyCreateData) => createCompany(company),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: companyKeys.lists() }),
    meta: { toast: { success: "Companies.success.create", error: "Companies.error.create" } },
  });
}

// Hook to update a company
export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompanyUpdateData }) => updateCompany(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
    meta: { toast: { success: "Companies.success.update", error: "Companies.error.update" } },
  });
}

// Hook to duplicate a company
export function useDuplicateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateCompany(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
    meta: { toast: { success: "Companies.success.duplicate", error: "Companies.error.duplicate" } },
  });
}

// Hook to delete a company
export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCompany,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.removeQueries({ queryKey: companyKeys.detail(variables) });
    },
    meta: { toast: { success: "Companies.success.delete", error: "Companies.error.delete" } },
  });
}

// Hook to bulk delete companies
export function useBulkDeleteCompanies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteCompanies,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: companyKeys.lists() }),
    meta: {
      toast: { success: "Companies.success.delete", error: "Companies.error.delete" },
    },
  });
}
