import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import {
  createIndividual,
  fetchIndividualById,
  updateIndividual,
  duplicateIndividual,
  fetchIndividuals,
} from "./individual.service";
import { IndividualCreateData, IndividualUpdateData } from "./individual.type";

export const individualKeys = {
  all: ["individuals"] as const,
  lists: () => [...individualKeys.all, "list"] as const,
  list: (filters: any) => [...individualKeys.lists(), { filters }] as const,
  details: () => [...individualKeys.all, "detail"] as const,
  detail: (id: string) => [...individualKeys.details(), id] as const,
};

export function useIndividuals() {
  return useQuery({
    queryKey: individualKeys.lists(),
    queryFn: fetchIndividuals,
  });
}

export function useIndividual(id: string) {
  return useQuery({
    queryKey: individualKeys.detail(id),
    queryFn: () => fetchIndividualById(id),
    enabled: !!id,
  });
}

export function useCreateIndividual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newIndividual: IndividualCreateData) => createIndividual(newIndividual),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: individualKeys.lists() }),
    meta: {
      operation: "create",
      toast: { success: "Individuals.success.create", error: "Individuals.error.create" },
    },
  });
}

export function useUpdateIndividual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IndividualUpdateData }) =>
      updateIndividual(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: individualKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: individualKeys.lists() });
    },
    meta: {
      operation: "update",
      toast: { success: "Individuals.success.update", error: "Individuals.error.update" },
    },
  });
}

export function useDuplicateIndividual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateIndividual(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: individualKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: individualKeys.lists() });
    },
    meta: {
      operation: "duplicate",
      toast: { success: "Individuals.success.duplicate", error: "Individuals.error.duplicate" },
    },
  });
}

export function useDeleteIndividual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResourceById(`/api/resource/individuals/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: individualKeys.lists() });
      queryClient.removeQueries({ queryKey: individualKeys.detail(variables) });
    },
    meta: {
      operation: "delete",
      toast: { success: "Individuals.success.delete", error: "Individuals.error.delete" },
    },
  });
}
// Hook for bulk deleting individuals
export function useBulkDeleteIndividuals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteResource("/api/resource/individuals", ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: individualKeys.lists() }),
    meta: {
      operation: "delete",
      toast: { success: "Individuals.success.delete", error: "Individuals.error.delete" },
    },
  });
}
