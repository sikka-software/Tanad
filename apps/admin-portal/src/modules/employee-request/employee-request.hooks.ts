import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { departmentKeys } from "../department/department.hooks";
import {
  createEmployeeRequest,
  deleteEmployeeRequest,
  fetchEmployeeRequestById,
  fetchEmployeeRequests,
  updateEmployeeRequest,
  bulkDeleteEmployeeRequests,
  duplicateEmployeeRequest,
} from "./employee-request.service";
import {
  EmployeeRequest,
  EmployeeRequestCreateData,
  EmployeeRequestUpdateData,
} from "./employee-request.type";

export const employeeRequestKeys = {
  all: ["employee_requests"] as const,
  lists: () => [...employeeRequestKeys.all, "list"] as const,
  list: (filters: any) => [...employeeRequestKeys.lists(), { filters }] as const,
  details: () => [...employeeRequestKeys.all, "detail"] as const,
  detail: (id: string) => [...employeeRequestKeys.details(), id] as const,
};

export function useEmployeeRequests() {
  return useQuery({
    queryKey: employeeRequestKeys.lists(),
    queryFn: fetchEmployeeRequests,
  });
}

export function useEmployeeRequest(id: string) {
  return useQuery({
    queryKey: employeeRequestKeys.detail(id),
    queryFn: () => fetchEmployeeRequestById(id),
    enabled: !!id,
  });
}

export const useCreateEmployeeRequest = () => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeRequest: EmployeeRequestCreateData) =>
      createEmployeeRequest(employeeRequest),
    onSuccess: (newEmployeeRequest) => {
      const previousEmployeeRequests = queryClient.getQueryData(employeeRequestKeys.lists()) || [];
      queryClient.setQueryData(employeeRequestKeys.lists(), [
        ...(Array.isArray(previousEmployeeRequests) ? previousEmployeeRequests : []),
        newEmployeeRequest,
      ]);

      queryClient.invalidateQueries({ queryKey: employeeRequestKeys.lists() });
    },
    meta: {
      toast: { success: "EmployeeRequests.success.create", error: "EmployeeRequests.error.create" },
    },
  });
};

export function useDuplicateEmployeeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateEmployeeRequest(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: employeeRequestKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: employeeRequestKeys.lists() });
    },
    meta: {
      toast: {
        success: "EmployeeRequests.success.duplicate",
        error: "EmployeeRequests.error.duplicate",
      },
    },
  });
}
export function useUpdateEmployeeRequest() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EmployeeRequestUpdateData }) =>
      updateEmployeeRequest(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: employeeRequestKeys.lists() });
      await queryClient.cancelQueries({ queryKey: employeeRequestKeys.detail(id) });

      // Snapshot the previous values
      const previousEmployeeRequests = queryClient.getQueryData(employeeRequestKeys.lists());
      const previousEmployeeRequest = queryClient.getQueryData(employeeRequestKeys.detail(id));

      // Prepare updates to apply optimistically
      const optimisticUpdates = { ...data };

      // Handle department_id changes to also update the department name for UI
      if (data.employee_id !== undefined) {
        try {
          // Get the current departments from the cache
          const employees: any = queryClient.getQueryData(employeeRequestKeys.lists());

          if (employees && Array.isArray(employees)) {
            // Find the department with the matching ID
            const employee = employees.find((e: any) => e.id === data.employee_id);

            if (employee) {
              optimisticUpdates.employee_id = employee.id;
            }
          }
        } catch (error) {
          console.error("Error getting department name for optimistic update:", error);
        }
      }

      // Optimistically update the cache
      queryClient.setQueryData(
        employeeRequestKeys.lists(),
        (old: EmployeeRequest[] | undefined) => {
          if (!old) return old;

          return old.map((employeeRequest) => {
            if (employeeRequest.id === id) {
              return { ...employeeRequest, ...optimisticUpdates };
            }
            return employeeRequest;
          });
        },
      );

      if (previousEmployeeRequest) {
        queryClient.setQueryData(
          employeeRequestKeys.detail(id),
          (old: EmployeeRequest | undefined) => {
            if (!old) return old;
            return { ...old, ...optimisticUpdates };
          },
        );
      }

      return { previousEmployeeRequests, previousEmployeeRequest };
    },
    onSuccess: (updatedEmployee, { id }) => {
      // Manually update the cache with the new data instead of invalidating
      queryClient.setQueryData(
        employeeRequestKeys.lists(),
        (old: EmployeeRequest[] | undefined) => {
          if (!old) return [updatedEmployee];

          return old.map((employeeRequest) =>
            employeeRequest.id === id ? updatedEmployee : employeeRequest,
          );
        },
      );

      // Also update the individual employee query data if it exists
      queryClient.setQueryData(employeeRequestKeys.detail(id), updatedEmployee);
    },
    onError: (err, { id }, context) => {
      // Roll back to the previous values if mutation fails
      if (context?.previousEmployeeRequests) {
        queryClient.setQueryData(employeeRequestKeys.lists(), context.previousEmployeeRequests);
      }
      if (context?.previousEmployeeRequest) {
        queryClient.setQueryData(employeeRequestKeys.detail(id), context.previousEmployeeRequest);
      }
    },
    meta: {
      toast: { success: "EmployeeRequests.success.update", error: "EmployeeRequests.error.update" },
    },
  });
}

export function useDeleteEmployeeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployeeRequest,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeRequestKeys.lists() });
      queryClient.removeQueries({ queryKey: employeeRequestKeys.detail(variables) });
    },
    meta: {
      toast: { success: "EmployeeRequests.success.delete", error: "EmployeeRequests.error.delete" },
    },
  });
}

export function useBulkDeleteEmployeeRequests() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteEmployeeRequests,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeRequestKeys.lists() }),
    meta: {
      toast: { success: "EmployeeRequests.success.delete", error: "EmployeeRequests.error.delete" },
    },
  });
}
