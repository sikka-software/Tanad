import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  duplicateDepartment,
  bulkDeleteDepartments,
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
export const useDepartments = () => {
  return useQuery({
    queryKey: departmentKeys.lists(),
    queryFn: fetchDepartmentsWithLocations,
    // queryFn: fetchDepartments,
  });
};

// Hook to fetch a single department
export const useDepartment = (id: string) => {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => fetchDepartmentById(id),
    enabled: !!id,
  });
};
// Create Mutation Hook
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (data: DepartmentCreateData) => createDepartment(data),
    mutationFn: (data: DepartmentCreateData) => createDepartmentWithLocations(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
};

// Update Mutation Hook
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) =>
      updateDepartment(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
};

// Duplicate Mutation Hook
export const useDuplicateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
};

// Delete Mutation Hook
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.removeQueries({ queryKey: departmentKeys.detail(variables) });
    },
  });
};

// Hook to bulk delete departments
export function useBulkDeleteDepartments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteDepartments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
}
