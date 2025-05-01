import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { departmentKeys } from "@/department/department.hooks";

import {
  createEmployee,
  deleteEmployee,
  duplicateEmployee,
  fetchEmployeeById,
  fetchEmployees,
  updateEmployee,
} from "@/employee/employee.service";
import { Employee, EmployeeCreateData } from "@/employee/employee.types";

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (filters: any) => [...employeeKeys.lists(), { filters }] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

// Hook for fetching all employees
export const useEmployees = () => {
  return useQuery({
    queryKey: employeeKeys.lists(),
    queryFn: fetchEmployees,
    staleTime: 10000, // Consider data fresh for 10 seconds
  });
};

// Hook for fetching a single employee by ID
export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => fetchEmployeeById(id),
    enabled: !!id,
  });
};

// Hook for adding a new employee
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employee: EmployeeCreateData) => createEmployee(employee),
    onSuccess: (newEmployee) => {
      const previousEmployees = queryClient.getQueryData(employeeKeys.lists()) || [];
      queryClient.setQueryData(employeeKeys.lists(), [
        ...(Array.isArray(previousEmployees) ? previousEmployees : []),
        newEmployee,
      ]);
    },
  });
};

// Hook for duplicating an employee
export const useDuplicateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateEmployee(id),
  });
};

// Hook for updating an employee with optimistic updates
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Employee> }) =>
      updateEmployee(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: employeeKeys.lists() });
      await queryClient.cancelQueries({ queryKey: employeeKeys.detail(id) });

      // Snapshot the previous values
      const previousEmployees = queryClient.getQueryData(employeeKeys.lists());
      const previousEmployee = queryClient.getQueryData(employeeKeys.detail(id));

      // Prepare updates to apply optimistically
      const optimisticUpdates = { ...updates };

      // Handle department_id changes to also update the department name for UI
      if (updates.department_id !== undefined) {
        try {
          // Get the current departments from the cache
          const departments: any = queryClient.getQueryData(departmentKeys.lists());

          if (departments && Array.isArray(departments)) {
            // Find the department with the matching ID
            const department = departments.find((d: any) => d.id === updates.department_id);

            if (department) {
              // Set the department name for the optimistic update
              optimisticUpdates.department = department.name;
            }
          }
        } catch (error) {
          console.error("Error getting department name for optimistic update:", error);
        }
      }

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
      // Manually update the cache with the new data instead of invalidating
      queryClient.setQueryData(employeeKeys.lists(), (old: Employee[] | undefined) => {
        if (!old) return [updatedEmployee];

        return old.map((employee) => (employee.id === id ? updatedEmployee : employee));
      });

      // Also update the individual employee query data if it exists
      queryClient.setQueryData(employeeKeys.detail(id), updatedEmployee);
    },
    onError: (err, { id }, context) => {
      // Roll back to the previous values if mutation fails
      if (context?.previousEmployees) {
        queryClient.setQueryData(employeeKeys.lists(), context.previousEmployees);
      }
      if (context?.previousEmployee) {
        queryClient.setQueryData(employeeKeys.detail(id), context.previousEmployee);
      }
    },
    // Don't invalidate queries on settle - we're manually updating the cache
  });
};

// Hook for deleting an employee
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
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
};

export function useBulkDeleteEmployees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch("/api/employees/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete offices");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}
