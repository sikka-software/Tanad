import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createClient,
  deleteClient,
  fetchClientById,
  fetchClients,
  updateClient,
  bulkDeleteClients,
  duplicateClient,
} from "@/client/client.service";
import { ClientCreateData, ClientUpdateData } from "@/client/client.type";

export const clientKeys = {
  all: ["clients"] as const,
  lists: () => [...clientKeys.all, "list"] as const,
  list: (filters: any) => [...clientKeys.lists(), { filters }] as const,
  details: () => [...clientKeys.all, "detail"] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

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
  return useMutation({
    mutationFn: (newClient: ClientCreateData) => createClient(newClient),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientKeys.lists() }),
    meta: { toast: { success: "Clients.success.create", error: "Clients.error.create" } },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClientUpdateData }) => updateClient(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
    meta: { toast: { success: "Clients.success.update", error: "Clients.error.update" } },
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
    meta: { toast: { success: "Clients.success.duplicate", error: "Clients.error.duplicate" } },
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
    meta: { toast: { success: "Clients.success.delete", error: "Clients.error.delete" } },
  });
}
// Hook for bulk deleting clients
export function useBulkDeleteClients() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteClients,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientKeys.lists() }),
    meta: { toast: { success: "Clients.success.delete", error: "Clients.error.delete" } },
  });
}
