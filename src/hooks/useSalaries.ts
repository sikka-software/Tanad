import { useCallback, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSalaries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/salaries");
      if (!response.ok) {
        throw new Error("Failed to fetch salaries");
      }
      const data = await response.json();
      return data as Salary[];
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSalaryById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/salaries?id=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch salary");
      }
      const data = await response.json();
      return data as Salary;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSalary = useCallback(async (salary: SalaryCreateData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/salaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(salary),
      });
      if (!response.ok) {
        throw new Error("Failed to create salary");
      }
      const data = await response.json();
      return data as Salary;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSalary = useCallback(async (id: string, salary: Partial<Omit<Salary, "id" | "created_at">>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/salaries?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(salary),
      });
      if (!response.ok) {
        throw new Error("Failed to update salary");
      }
      const data = await response.json();
      return data as Salary;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSalary = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/salaries?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete salary");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    fetchSalaries,
    fetchSalaryById,
    createSalary,
    updateSalary,
    deleteSalary,
  };
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
