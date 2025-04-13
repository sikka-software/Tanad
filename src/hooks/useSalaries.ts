import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSalary,
  deleteSalary,
  fetchSalaryById,
  fetchSalaries,
  updateSalary,
} from "@/services/salaryService";
import type { Salary, SalaryCreateData } from "@/types/salary.type";

// Query keys for salaries
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
    queryKey: ["salaries"],
    queryFn: fetchSalaries,
  });
}

// Hook to fetch a single salary by ID
export function useSalary(id: string) {
  return useQuery({
    queryKey: ["salaries", id],
    queryFn: () => fetchSalaryById(id),
    enabled: !!id,
  });
}

// Hook for creating a new salary
export function useCreateSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newSalary: Omit<Salary, "id" | "created_at">) => createSalary(newSalary),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
    },
  });
}

// Hook for updating an existing salary
export function useUpdateSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      salary,
    }: {
      id: string;
      salary: Partial<Omit<Salary, "id" | "created_at">>;
    }) => updateSalary(id, salary),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
    },
  });
}

// Hook for deleting a salary
export function useDeleteSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSalary(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
      queryClient.removeQueries({ queryKey: salaryKeys.detail(variables) });
    },
  });
}
