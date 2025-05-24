import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { bulkDeleteResource, deleteResourceById } from "@/lib/api";

import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  duplicateDepartment,
  fetchDepartmentById,
  fetchDepartmentsWithLocations,
  createDepartmentWithLocations,
} from "./department.service";
import type { Department, DepartmentCreateData } from "./department.type";

export const departmentKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentKeys.all, "list"] as const,
  list: (filters: any) => [...departmentKeys.lists(), { filters }] as const,
  details: () => [...departmentKeys.all, "detail"] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
};

// List Query Hook
export function useDepartments() {
  return useQuery({
    queryKey: departmentKeys.lists(),
    queryFn: fetchDepartments,
  });
}

// Hook to fetch a single department
export function useDepartment(id: string) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => fetchDepartmentById(id),
    enabled: !!id,
  });
}
// Create Mutation Hook
export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (data: DepartmentCreateData) => createDepartment(data),
    mutationFn: (data: DepartmentCreateData) => createDepartmentWithLocations(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
    meta: {
      operation: "create",
      toast: { success: "Departments.success.create", error: "Departments.error.create" },
    },
  });
}

// Update Mutation Hook
export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) =>
      updateDepartment(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
    meta: {
      operation: "update",
      toast: { success: "Departments.success.update", error: "Departments.error.update" },
    },
  });
}

// Duplicate Mutation Hook
export function useDuplicateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
    meta: {
      operation: "duplicate",
      toast: { success: "Departments.success.duplicate", error: "Departments.error.duplicate" },
    },
  });
}

// Delete Mutation Hook
export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResourceById(`/api/resource/departments/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.removeQueries({ queryKey: departmentKeys.detail(variables) });
    },
    meta: {
      operation: "delete",
      toast: { success: "Departments.success.delete", error: "Departments.error.delete" },
    },
  });
}

// Hook to bulk delete departments
export function useBulkDeleteDepartments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteResource("/api/resource/departments", ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
    meta: {
      operation: "delete",
      toast: { success: "Departments.success.delete", error: "Departments.error.delete" },
    },
  });
}
