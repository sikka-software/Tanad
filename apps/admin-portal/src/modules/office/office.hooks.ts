import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

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

      toast.success(t("General.successful_operation"), {
        description: t("Offices.success.create"),
      });
    },
    onError: (error) => {
      toast.error(t("General.error_operation"), {
        description: t("Offices.error.create"),
      });
    },
  });
}

// Hook to update a office
export function useUpdateOffice() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ id, office }: { id: string; office: OfficeUpdateData }) =>
      updateOffice(id, office),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: officeKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
      toast.success(t("General.successful_operation"), {
        description: t("Offices.success.update"),
      });
    },
    onError: (error) => {
      toast.error(t("General.error_operation"), {
        description: t("Offices.error.update"),
      });
    },
  });
}

export function useDuplicateOffice() {
  const queryClient = useQueryClient();
  const t = useTranslations();
  return useMutation({
    mutationFn: (id: string) => duplicateOffice(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: officeKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
    },
    onError: (error) => {
      toast.error(t("General.error_operation"), {
        description: t("Offices.error.duplicate"),
      });
    },
  });
}

// Hook to delete a office
export function useDeleteOffice() {
  const queryClient = useQueryClient();
  const t = useTranslations();
  return useMutation({
    mutationFn: deleteOffice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
      queryClient.removeQueries({ queryKey: officeKeys.detail(variables) });
      toast.success(t("General.successful_operation"), {
        description: t("Offices.success.delete"),
      });
    },
    onError: (error) => {
      toast.error(t("General.error_operation"), {
        description: t("Offices.error.delete"),
      });
    },
  });
}

// Hook to bulk delete offices
export function useBulkDeleteOffices() {
  const queryClient = useQueryClient();
  const t = useTranslations();
  return useMutation({
    mutationFn: bulkDeleteOffices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
      toast.success(t("General.successful_operation"), {
        description: t("Offices.success.bulk_delete"),
      });
    },
    onError: (error) => {
      toast.error(t("General.error_operation"), {
        description: t("Offices.error.bulk_delete"),
      });
    },
  });
}
