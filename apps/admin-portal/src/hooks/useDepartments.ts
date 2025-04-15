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
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Department> }) =>
      updateDepartment(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: [...DEPARTMENTS_QUERY_KEY, id] });

      // Snapshot the previous value
      const previousDepartments = queryClient.getQueryData(DEPARTMENTS_QUERY_KEY);
      const previousDepartment = queryClient.getQueryData([...DEPARTMENTS_QUERY_KEY, id]);

      // Optimistically update the cache
      queryClient.setQueryData(DEPARTMENTS_QUERY_KEY, (old: Department[] | undefined) => {
        if (!old) return old;
        return old.map((dept) => (dept.id === id ? { ...dept, ...updates } : dept));
      });

      queryClient.setQueryData([...DEPARTMENTS_QUERY_KEY, id], (old: Department | undefined) => {
        if (!old) return old;
        return { ...old, ...updates };
      });

      // Return a context object with the snapshotted value
      return { previousDepartments, previousDepartment };
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousDepartments) {
        queryClient.setQueryData(DEPARTMENTS_QUERY_KEY, context.previousDepartments);
      }
      if (context?.previousDepartment) {
        queryClient.setQueryData([...DEPARTMENTS_QUERY_KEY, id], context.previousDepartment);
      }
    },
    onSettled: (_, __, { id }) => {
      // Always refetch after error or success to ensure cache consistency
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...DEPARTMENTS_QUERY_KEY, id] });
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
