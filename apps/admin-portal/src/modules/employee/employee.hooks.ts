import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import {
  createEmployee,
  duplicateEmployee,
  fetchEmployeeById,
  fetchEmployees,
  updateEmployee,
} from "@/employee/employee.service";
import { Employee, EmployeeCreateData, EmployeeUpdateData } from "@/employee/employee.types";

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (filters: any) => [...employeeKeys.lists(), { filters }] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

// Hook for fetching all employees
export function useEmployees(): UseQueryResult<Employee[]> {
  return useQuery({
    queryKey: employeeKeys.lists(),
    queryFn: fetchEmployees,
    staleTime: 10000, // Consider data fresh for 10 seconds
  });
}

// Hook for fetching a single employee by ID
export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => fetchEmployeeById(id),
    enabled: !!id,
  });
}

// Hook for adding a new employee
export function useCreateEmployee() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employee: EmployeeCreateData) => createEmployee(employee),
    onSuccess: (newEmployee) => {
      const previousEmployees = queryClient.getQueryData(employeeKeys.lists()) || [];
      queryClient.setQueryData(employeeKeys.lists(), [
        ...(Array.isArray(previousEmployees) ? previousEmployees : []),
        newEmployee,
      ]);
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

// Hook for duplicating an employee
export function useDuplicateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateEmployee(id),
  });
}

// Hook for updating an employee with optimistic updates
export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EmployeeUpdateData }) =>
      updateEmployee(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: employeeKeys.lists() });
      await queryClient.cancelQueries({ queryKey: employeeKeys.detail(id) });

      // Snapshot the previous values
      const previousEmployees = queryClient.getQueryData(employeeKeys.lists());
      const previousEmployee = queryClient.getQueryData(employeeKeys.detail(id));

      // Prepare updates to apply optimistically
      const optimisticUpdates = { ...data };

      // Optimistically update the cache
      queryClient.setQueryData(employeeKeys.lists(), (old: Employee[] | undefined) => {
        if (!old) return old;

        return old.map((employee) => {
          if (employee.id === id) {
            return { ...employee, ...optimisticUpdates };
          }
          return employee;
        });
      });

      if (previousEmployee) {
        queryClient.setQueryData(employeeKeys.detail(id), (old: Employee | undefined) => {
          if (!old) return old;
          return { ...old, ...optimisticUpdates };
        });
      }

      return { previousEmployees, previousEmployee };
    },
    onSuccess: (updatedEmployee, { id }) => {
      queryClient.setQueryData(employeeKeys.lists(), (old: Employee[] | undefined) => {
        if (!old) return [updatedEmployee];

        return old.map((employee) => (employee.id === id ? updatedEmployee : employee));
      });
      queryClient.setQueryData(employeeKeys.detail(id), updatedEmployee);
    },
    onError: (err, { id }, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(employeeKeys.lists(), context.previousEmployees);
      }
      if (context?.previousEmployee) {
        queryClient.setQueryData(employeeKeys.detail(id), context.previousEmployee);
      }
    },
  });
}

// Hook for deleting an employee
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteResourceById(`/api/resource/employees/${id}`),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: employeeKeys.lists() });

      // Snapshot the previous value
      const previousEmployees = queryClient.getQueryData(employeeKeys.lists());

      // Optimistically remove the employee from the list
      queryClient.setQueryData(employeeKeys.lists(), (old: Employee[] | undefined) => {
        if (!old) return old;
        return old.filter((employee) => employee.id !== id);
      });

      return { previousEmployees };
    },
    onError: (_, __, context) => {
      // Roll back to the previous value if mutation fails
      if (context?.previousEmployees) {
        queryClient.setQueryData(employeeKeys.lists(), context.previousEmployees);
      }
    },
    onSettled: () => {
      // Always refetch to ensure cache consistency
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useBulkDeleteEmployees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { ids: string[]; cascade?: boolean }) => {
      // First check if any of the employees have requests
      const checkResponse = await fetch("/api/resource/employees/check_requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: params.ids }),
      });

      if (!checkResponse.ok) {
        throw new Error("Failed to check employee requests");
      }

      const checkData = await checkResponse.json();

      // If there are requests but cascade is not enabled, throw an error
      if (checkData.has_requests && !params.cascade) {
        throw new Error(
          `Cannot delete employees with ${checkData.request_count} associated requests. Please use cascade delete.`,
        );
      }

      // Proceed with deletion
      return await bulkDeleteResource("/api/resource/employees", params.ids, {
        cascade: params.cascade,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
    meta: {
      toast: { success: "Employees.success.delete", error: "Employees.error.delete" },
    },
  });
}
