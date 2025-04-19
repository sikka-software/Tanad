import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCompany,
  deleteCompany,
  bulkDeleteCompanies,
  fetchCompanyById,
  fetchCompanies,
  updateCompany,
} from "@/services/companyService";

import type { Company, CompanyCreateData } from "@/modules/company/company.type";

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
    mutationFn: (newCompany: Omit<Company, "id" | "created_at"> & { user_id: string }) => {
      const { user_id, ...rest } = newCompany;
      const companyData: CompanyCreateData = {
        ...rest,
        user_id: user_id,
      };
      return createCompany(companyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

// Hook to update a company
export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Company> }) => updateCompany(id, data),
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
