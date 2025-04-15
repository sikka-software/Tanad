import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createDepartment,
  deleteDepartment,
  fetchDepartmentById,
  fetchDepartments,
  updateDepartment,
} from "@/services/departmentService";
import { Department, DepartmentCreateData } from "@/types/department.type";

// Hooks
export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });
}

export function useDepartment(id: string) {
  return useQuery({
    queryKey: ["departments", id],
    queryFn: () => fetchDepartmentById(id),
    enabled: !!id,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newDepartment: Omit<Department, "id" | "created_at">) =>
      createDepartment(newDepartment as DepartmentCreateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      department,
    }: {
      id: string;
      department: Partial<Omit<Department, "id" | "created_at">>;
    }) => updateDepartment(id, department),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["departments", data.id] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.removeQueries({ queryKey: ["departments", variables] });
    },
  });
}
