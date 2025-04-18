import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSalary,
  deleteSalary,
  fetchSalaryById,
  fetchSalaries,
  updateSalary,
  bulkDeleteSalaries,
} from "@/services/salaryService";

import type { Salary } from "@/types/salary.type";

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
    mutationFn: createSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
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
      queryClient.invalidateQueries({ queryKey: ["salaries", data.id] });
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
    },
  });
}

// Hook for deleting a salary
export function useDeleteSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
    },
  });
}

// Hook for bulk deleting salaries
export function useBulkDeleteSalaries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteSalaries,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
    },
  });
}
