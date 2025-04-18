import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createClient,
  deleteClient,
  fetchClientById,
  fetchClients,
  updateClient,
} from "@/services/clientService";

import { Client, ClientCreateData } from "@/types/client.type";

// Hooks
export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
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
      queryClient.invalidateQueries({ queryKey: ["clients"] });
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
      queryClient.invalidateQueries({ queryKey: ["clients", data.id] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.removeQueries({ queryKey: ["clients", variables] });
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
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}
