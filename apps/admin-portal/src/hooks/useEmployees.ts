import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  EMPLOYEES_QUERY_KEY,
  addEmployee as addEmployeeService,
  deleteEmployee as deleteEmployeeService,
  fetchEmployeeById,
  fetchEmployees as fetchEmployeesService,
  updateEmployee as updateEmployeeService,
} from "@/services/employeeService";
import { Employee } from "@/types/employee.type";

// Hook for fetching all employees
export const useEmployees = () => {
  return useQuery({
    queryKey: EMPLOYEES_QUERY_KEY,
    queryFn: fetchEmployeesService,
    staleTime: 10000, // Consider data fresh for 10 seconds
  });
};

// Hook for fetching a single employee by ID
export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: [...EMPLOYEES_QUERY_KEY, id],
    queryFn: () => fetchEmployeeById(id),
    enabled: !!id,
  });
};

// Hook for updating an employee with optimistic updates
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Employee> }) =>
      updateEmployeeService(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: [...EMPLOYEES_QUERY_KEY, id] });

      // Snapshot the previous values
      const previousEmployees = queryClient.getQueryData(EMPLOYEES_QUERY_KEY);
      const previousEmployee = queryClient.getQueryData([...EMPLOYEES_QUERY_KEY, id]);
      
      // Prepare updates to apply optimistically
      const optimisticUpdates = { ...updates };
      
      // Handle department_id changes to also update the department name for UI
      if (updates.department_id !== undefined) {
        try {
          // Get the current departments from the cache
          const departments: any = queryClient.getQueryData(["departments"]);
          
          if (departments && Array.isArray(departments)) {
            // Find the department with the matching ID
            const department = departments.find(
              (d: any) => d.id === updates.department_id
            );
            
            if (department) {
              // Set the department name for the optimistic update
              optimisticUpdates.department = department.name;
            }
          }
        } catch (error) {
          console.error('Error getting department name for optimistic update:', error);
        }
      }

      // Optimistically update the cache
      queryClient.setQueryData(EMPLOYEES_QUERY_KEY, (old: Employee[] | undefined) => {
        if (!old) return old;
        
        return old.map((employee) => {
          if (employee.id === id) {
            return { ...employee, ...optimisticUpdates };
          }
          return employee;
        });
      });

      if (previousEmployee) {
        queryClient.setQueryData([...EMPLOYEES_QUERY_KEY, id], (old: Employee | undefined) => {
          if (!old) return old;
          return { ...old, ...optimisticUpdates };
        });
      }

      return { previousEmployees, previousEmployee };
    },
    onSuccess: (updatedEmployee, { id }) => {
      // Manually update the cache with the new data instead of invalidating
      queryClient.setQueryData(EMPLOYEES_QUERY_KEY, (old: Employee[] | undefined) => {
        if (!old) return [updatedEmployee];
        
        return old.map(employee => 
          employee.id === id ? updatedEmployee : employee
        );
      });
      
      // Also update the individual employee query data if it exists
      queryClient.setQueryData([...EMPLOYEES_QUERY_KEY, id], updatedEmployee);
    },
    onError: (err, { id }, context) => {
      // Roll back to the previous values if mutation fails
      if (context?.previousEmployees) {
        queryClient.setQueryData(EMPLOYEES_QUERY_KEY, context.previousEmployees);
      }
      if (context?.previousEmployee) {
        queryClient.setQueryData([...EMPLOYEES_QUERY_KEY, id], context.previousEmployee);
      }
    },
    // Don't invalidate queries on settle - we're manually updating the cache
  });
};

// Hook for adding a new employee
export const useAddEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employee: Omit<Employee, "id" | "created_at" | "updated_at">) =>
      addEmployeeService(employee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    },
  });
};

// Hook for deleting an employee
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEmployeeService(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: EMPLOYEES_QUERY_KEY });

      // Snapshot the previous value
      const previousEmployees = queryClient.getQueryData(EMPLOYEES_QUERY_KEY);

      // Optimistically remove the employee from the list
      queryClient.setQueryData(EMPLOYEES_QUERY_KEY, (old: Employee[] | undefined) => {
        if (!old) return old;
        return old.filter((employee) => employee.id !== id);
      });

      return { previousEmployees };
    },
    onError: (_, __, context) => {
      // Roll back to the previous value if mutation fails
      if (context?.previousEmployees) {
        queryClient.setQueryData(EMPLOYEES_QUERY_KEY, context.previousEmployees);
      }
    },
    onSettled: () => {
      // Always refetch to ensure cache consistency
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    },
  });
};
