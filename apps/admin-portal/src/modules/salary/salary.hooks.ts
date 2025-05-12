import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSalary,
  deleteSalary,
  fetchSalaryById,
  fetchSalaries,
  updateSalary,
  bulkDeleteSalaries,
  duplicateSalary,
} from "@/salary/salary.service";
import type { Salary, SalaryUpdateData } from "@/salary/salary.type";

export const salaryKeys = {
  all: ["salaries"] as const,
  lists: () => [...salaryKeys.all, "list"] as const,
  list: (filters: any) => [...salaryKeys.lists(), { filters }] as const,
  details: () => [...salaryKeys.all, "detail"] as const,
  detail: (id: string) => [...salaryKeys.details(), id] as const,
};

// Hook to fetch all salaries
export function useSalaries() {
  return useQuery({
    queryKey: salaryKeys.lists(),
    queryFn: fetchSalaries,
  });
}

// Hook to fetch a single salary by ID
export function useSalary(id: string) {
  return useQuery({
    queryKey: salaryKeys.detail(id),
    queryFn: () => fetchSalaryById(id),
    enabled: !!id,
  });
}

// Hook for creating a new salary
export function useCreateSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSalary,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: salaryKeys.lists() }),
    meta: { toast: { success: "Salaries.success.create", error: "Salaries.error.create" } },
  });
}

// Hook for duplicating a salary
export function useDuplicateSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateSalary(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: salaryKeys.lists() }),
    meta: { toast: { success: "Salaries.success.duplicate", error: "Salaries.error.duplicate" } },
  });
}

// Hook for updating an existing salary
export function useUpdateSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SalaryUpdateData }) => updateSalary(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
    },
    meta: { toast: { success: "Salaries.success.update", error: "Salaries.error.update" } },
  });
}

// Hook for deleting a salary
export function useDeleteSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSalary,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: salaryKeys.lists() }),
    meta: { toast: { success: "Salaries.success.delete", error: "Salaries.error.delete" } },
  });
}

// Hook for bulk deleting salaries
export function useBulkDeleteSalaries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteSalaries,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: salaryKeys.lists() }),
    meta: { toast: { success: "Salaries.success.delete", error: "Salaries.error.delete" } },
  });
}
