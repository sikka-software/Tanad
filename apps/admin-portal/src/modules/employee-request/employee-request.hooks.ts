import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import {
  createEmployeeRequest,
  deleteEmployeeRequest,
  fetchEmployeeRequestById,
  fetchEmployeeRequests,
  updateEmployeeRequest,
  bulkDeleteEmployeeRequests,
} from "./employee-request.service";
import { EmployeeRequest } from "./employee-request.type";

export const employeeRequestKeys = {
  all: ["employeeRequests"] as const,
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

export function useCreateEmployeeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeRequest: EmployeeRequest) => createEmployeeRequest(employeeRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeRequestKeys.lists() });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmployeeRequest> }) =>
      updateEmployeeRequest(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: employeeRequestKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: employeeRequestKeys.lists() });
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
  });
}

export function useBulkDeleteEmployeeRequests() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteEmployeeRequests,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeRequestKeys.lists() });
    },
  });
}
