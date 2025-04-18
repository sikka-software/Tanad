import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createOffice,
  deleteOffice,
  fetchOfficeById,
  fetchOffices,
  updateOffice,
} from "@/services/officeService";

import type { Office, OfficeCreateData } from "@/types/office.type";

export const officeKeys = {
  all: ["offices"] as const,
  lists: () => [...officeKeys.all, "list"] as const,
  list: (filters: any) => [...officeKeys.lists(), { filters }] as const,
  details: () => [...officeKeys.all, "detail"] as const,
  detail: (id: string) => [...officeKeys.details(), id] as const,
};

// Hooks
export function useOffices() {
  return useQuery({
    queryKey: officeKeys.lists(),
    queryFn: fetchOffices,
  });
}

export function useOffice(id: string) {
  return useQuery({
    queryKey: officeKeys.detail(id),
    queryFn: () => fetchOfficeById(id),
    enabled: !!id,
  });
}

export function useCreateOffice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newOffice: Omit<Office, "id" | "created_at"> & { user_id: string }) => {
      const { user_id, ...rest } = newOffice;
      const officeData: OfficeCreateData = {
        ...rest,
        user_id: user_id,
      };
      return createOffice(officeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
    },
  });
}

export function useUpdateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      office,
    }: {
      id: string;
      office: Partial<Omit<Office, "id" | "created_at">>;
    }) => updateOffice(id, office),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: officeKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
    },
  });
}

export function useDeleteOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOffice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
      queryClient.removeQueries({ queryKey: officeKeys.detail(variables) });
    },
  });
}

export function useBulkDeleteOffices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch("/api/offices/bulk-delete", {
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
      queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
    },
  });
}
