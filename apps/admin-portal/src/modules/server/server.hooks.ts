import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import {
  createServer,
  fetchServerById,
  fetchServers,
  updateServer,
  duplicateServer,
} from "@/server/server.service";
import type { ServerCreateData, ServerUpdateData } from "@/server/server.type";

// Query keys for servers
export const serverKeys = {
  all: ["servers"] as const,
  lists: () => [...serverKeys.all, "list"] as const,
  list: (filters: any) => [...serverKeys.lists(), { filters }] as const,
  details: () => [...serverKeys.all, "detail"] as const,
  detail: (id: string) => [...serverKeys.details(), id] as const,
};

// Hook to fetch all servers
export function useServers() {
  return useQuery({
    queryKey: serverKeys.lists(),
    queryFn: fetchServers,
  });
}

// Hook to fetch a single server by ID
export function useServer(id: string) {
  return useQuery({
    queryKey: serverKeys.detail(id),
    queryFn: () => fetchServerById(id),
    enabled: !!id, // Only run query if id is truthy
  });
}

// Hook for creating a new server
export function useCreateServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newServer: ServerCreateData) => {
      // Map user_id to user_id for the service function
      const { user_id, ...rest } = newServer;
      const serverData: ServerCreateData = {
        ...rest,
        user_id: user_id,
      };
      return createServer(serverData);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serverKeys.lists() }),
    meta: { toast: { success: "Servers.success.create", error: "Servers.error.create" } },
  });
}

// Hook for updating an existing server
export function useUpdateServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServerUpdateData }) => updateServer(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: serverKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: serverKeys.lists() });
    },
    meta: { toast: { success: "Servers.success.update", error: "Servers.error.update" } },
  });
}

// Hook for duplicating a server
export function useDuplicateServer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateServer(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: serverKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: serverKeys.lists() });
    },
    meta: { toast: { success: "Servers.success.duplicate", error: "Servers.error.duplicate" } },
  });
}

// Hook for deleting a server
export function useDeleteServer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResourceById(`/api/resource/servers/${id}`),
    onSuccess: (_, variables) => {
      // Invalidate the list and remove the specific detail query from cache
      queryClient.invalidateQueries({ queryKey: serverKeys.lists() });
      queryClient.removeQueries({ queryKey: serverKeys.detail(variables) });
    },
    meta: { toast: { success: "Servers.success.delete", error: "Servers.error.delete" } },
  });
}

// Hook for bulk deleting servers
export function useBulkDeleteServers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteResource("/api/resource/servers", ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serverKeys.lists() }),
    meta: { toast: { success: "Servers.success.delete", error: "Servers.error.delete" } },
  });
}
