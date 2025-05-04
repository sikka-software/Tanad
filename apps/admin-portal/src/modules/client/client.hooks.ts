import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  createClient,
  deleteClient,
  fetchClientById,
  fetchClients,
  updateClient,
  bulkDeleteClients,
  duplicateClient,
} from "@/client/client.service";
import { Client, ClientCreateData } from "@/client/client.type";

export const clientKeys = {
  all: ["clients"] as const,
  lists: () => [...clientKeys.all, "list"] as const,
  list: (filters: any) => [...clientKeys.lists(), { filters }] as const,
  details: () => [...clientKeys.all, "detail"] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

// Hooks
export function useClients() {
  return useQuery({
    queryKey: clientKeys.lists(),
    queryFn: fetchClients,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => fetchClientById(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: (newClient: Omit<Client, "id" | "created_at">) =>
      createClient(newClient as ClientCreateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      toast.success(t("General.successful_operation"), {
        description: t("Clients.success.create"),
      });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const t = useTranslations();
  return useMutation({
    mutationFn: ({
      id,
      client,
    }: {
      id: string;
      client: Partial<Omit<Client, "id" | "created_at">>;
    }) => updateClient(id, client),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      toast.success(t("General.successful_operation"), {
        description: t("Clients.success.update"),
      });
    },
  });
}

export function useDuplicateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateClient(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.removeQueries({ queryKey: clientKeys.detail(variables) });
    },
  });
}
// Hook for bulk deleting clients
export function useBulkDeleteClients() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteClients,
    onSuccess: () => {
      // Invalidate the list query
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}
