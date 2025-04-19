import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createDepartment,
  deleteDepartment,
  fetchDepartmentById,
  fetchDepartments,
  updateDepartment,
} from "@/services/departmentService";

import { Department, DepartmentCreateData } from "@/modules/department/department.type";

export const departmentKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentKeys.all, "list"] as const,
  list: (filters: any) => [...departmentKeys.lists(), { filters }] as const,
  details: () => [...departmentKeys.all, "detail"] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
};
// Hooks
export function useDepartments() {
  return useQuery({
    queryKey: departmentKeys.lists(),
    queryFn: fetchDepartments,
  });
}

export function useDepartment(id: string) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => fetchDepartmentById(id),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (department: DepartmentCreateData) => createDepartment(department),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
}

export const useDeleteDepartments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (departmentIds: string[]) => {
      const response = await fetch("/api/departments/bulk-delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ departmentIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete departments");
      }

      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
};
