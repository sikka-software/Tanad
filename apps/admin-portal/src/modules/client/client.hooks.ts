import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createClient,
  deleteClient,
  fetchClientById,
  fetchClients,
  updateClient,
} from "@/modules/client/client.service";

import { Client, ClientCreateData } from "@/types/client.type";

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

  return useMutation({
    mutationFn: (newClient: Omit<Client, "id" | "created_at">) =>
      createClient(newClient as ClientCreateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

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

export function useBulkDeleteClients() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch("/api/clients/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete clients");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}
