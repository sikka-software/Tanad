import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCompany,
  deleteCompany,
  bulkDeleteCompanies,
  fetchCompanyById,
  fetchCompanies,
  updateCompany,
  duplicateCompany,
} from "@/modules/company/company.service";
import type { Company, CompanyCreateData, CompanyUpdateData } from "@/modules/company/company.type";

// Query keys for companies
export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (filters: any) => [...companyKeys.lists(), { filters }] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
};

// Hook to fetch all companies
export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.lists(),
    queryFn: fetchCompanies,
  });
}

// Hook to fetch a single company
export function useCompany(id: string) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => fetchCompanyById(id),
    enabled: !!id,
  });
}

// Hook to create a company
export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (company: CompanyCreateData) => createCompany(company),
    onSuccess: (newCompany: Company) => {
      const previousCompanies = queryClient.getQueryData(companyKeys.lists()) || [];
      queryClient.setQueryData(companyKeys.lists(), [
        ...(Array.isArray(previousCompanies) ? previousCompanies : []),
        newCompany,
      ]);
    },
  });
}

// Hook to update a company
export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, company }: { id: string; company: CompanyUpdateData }) =>
      updateCompany(id, company),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
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
  });
}

// Hook to bulk delete companies
export function useBulkDeleteCompanies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteCompanies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}
