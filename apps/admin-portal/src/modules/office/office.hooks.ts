import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import {
  createOffice,
  deleteOffice,
  bulkDeleteOffices,
  fetchOfficeById,
  fetchOffices,
  updateOffice,
  duplicateOffice,
} from "@/office/office.service";
import type { Office, OfficeCreateData, OfficeUpdateData } from "@/office/office.type";

// Query keys for offices
export const officeKeys = {
  all: ["offices"] as const,
  lists: () => [...officeKeys.all, "list"] as const,
  list: (filters: any) => [...officeKeys.lists(), { filters }] as const,
  details: () => [...officeKeys.all, "detail"] as const,
  detail: (id: string) => [...officeKeys.details(), id] as const,
};

// Hook to fetch all offices
export function useOffices() {
  return useQuery({
    queryKey: officeKeys.lists(),
    queryFn: fetchOffices,
  });
}

// Hook to fetch a single office
export function useOffice(id: string) {
  return useQuery({
    queryKey: officeKeys.detail(id),
    queryFn: () => fetchOfficeById(id),
    enabled: !!id,
  });
}

// Hook to create a office
export function useCreateOffice() {
  const queryClient = useQueryClient();
  const t = useTranslations();
  return useMutation({
    mutationFn: (office: OfficeCreateData) => createOffice(office),
    onSuccess: (newOffice: Office) => {
      const previousOffices = queryClient.getQueryData(officeKeys.lists()) || [];
      queryClient.setQueryData(officeKeys.lists(), [
        ...(Array.isArray(previousOffices) ? previousOffices : []),
        newOffice,
      ]);
    },
    meta: { toast: { success: "Offices.success.create", error: "Offices.error.create" } },
  });
}

// Hook to update a office
export function useUpdateOffice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OfficeUpdateData }) => updateOffice(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: officeKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
    },
    meta: { toast: { success: "Offices.success.update", error: "Offices.error.update" } },
  });
}

export function useDuplicateOffice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateOffice(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: officeKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
    },
    meta: { toast: { success: "Offices.success.duplicate", error: "Offices.error.duplicate" } },
  });
}

// Hook to delete a office
export function useDeleteOffice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOffice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
      queryClient.removeQueries({ queryKey: officeKeys.detail(variables) });
    },
    meta: { toast: { success: "Offices.success.delete", error: "Offices.error.delete" } },
  });
}

// Hook to bulk delete offices
export function useBulkDeleteOffices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteOffices,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: officeKeys.lists() }),
    meta: { toast: { success: "Offices.success.delete", error: "Offices.error.delete" } },
  });
}
