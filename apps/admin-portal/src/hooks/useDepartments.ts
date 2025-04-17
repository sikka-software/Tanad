import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createDepartment,
  deleteDepartment,
  fetchDepartmentById,
  fetchDepartments,
  updateDepartment,
} from "@/services/departmentService";
import { Department, DepartmentCreateData } from "@/types/department.type";

export const DEPARTMENTS_QUERY_KEY = ["departments"] as const;

// Hooks
export function useDepartments() {
  return useQuery({
    queryKey: DEPARTMENTS_QUERY_KEY,
    queryFn: fetchDepartments,
  });
}

export function useDepartment(id: string) {
  return useQuery({
    queryKey: [...DEPARTMENTS_QUERY_KEY, id],
    queryFn: () => fetchDepartmentById(id),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (department: DepartmentCreateData) => createDepartment(department),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Department> }) => {
      const response = await fetch(`/api/departments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update department");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
    },
  });
}

export const useDeleteDepartments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (departmentIds: string[]) => {
      // Delete departments sequentially
      for (const id of departmentIds) {
        await deleteDepartment(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};
