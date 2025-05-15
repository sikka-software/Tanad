import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createOnlineStore,
  deleteOnlineStore,
  fetchOnlineStoreById,
  fetchOnlineStores,
  updateOnlineStore,
  bulkDeleteOnlineStores,
  duplicateOnlineStore,
} from "./online-store.service";
import type {
  OnlineStore,
  OnlineStoreCreateData,
  OnlineStoreUpdateData,
} from "./online-store.type";

// Query keys for online stores
export const onlineStoreKeys = {
  all: ["online-stores"] as const,
  lists: () => [...onlineStoreKeys.all, "list"] as const,
  list: (filters: any) => [...onlineStoreKeys.lists(), { filters }] as const,
  details: () => [...onlineStoreKeys.all, "detail"] as const,
  detail: (id: string) => [...onlineStoreKeys.details(), id] as const,
};

// Hook to fetch all online stores
export function useOnlineStores() {
  return useQuery({
    queryKey: onlineStoreKeys.lists(),
    queryFn: fetchOnlineStores,
  });
}

// Hook to fetch a single online store by ID
export function useOnlineStore(id: string) {
  return useQuery({
    queryKey: onlineStoreKeys.detail(id),
    queryFn: () => fetchOnlineStoreById(id),
    enabled: !!id, // Only run query if id is truthy
  });
}

// Hook for creating a new online store
export function useCreateOnlineStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newOnlineStore: OnlineStoreCreateData) => createOnlineStore(newOnlineStore),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: onlineStoreKeys.lists() }),
    meta: { toast: { success: "OnlineStores.success.create", error: "OnlineStores.error.create" } },
  });
}

// Hook for updating an existing branch
export function useUpdateOnlineStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OnlineStoreUpdateData }) =>
      updateOnlineStore(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: onlineStoreKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: onlineStoreKeys.lists() });

      // Snapshot the previous value
      const previousOnlineStore = queryClient.getQueryData<OnlineStore>(onlineStoreKeys.detail(id));
      const previousOnlineStores = queryClient.getQueryData<OnlineStore[]>(onlineStoreKeys.lists());

      // Optimistically update to the new value
      // Update detail cache
      if (previousOnlineStore) {
        queryClient.setQueryData<OnlineStore>(onlineStoreKeys.detail(id), {
          ...previousOnlineStore,
          ...data,
          // Ensure created_at is preserved if not part of the update
          created_at: previousOnlineStore.created_at,
        });
      }

      // Update list cache
      if (previousOnlineStores) {
        queryClient.setQueryData<OnlineStore[]>(
          onlineStoreKeys.lists(),
          previousOnlineStores.map((onlineStore) =>
            onlineStore.id === id
              ? { ...onlineStore, ...data, created_at: onlineStore.created_at } // Preserve created_at here too
              : onlineStore,
          ),
        );
      }

      // Return a context object with the snapshotted value
      return { previousOnlineStore, previousOnlineStores };
    },
    onError: (err, { id }, context) => {
      console.error("Update failed:", err);
      if (context?.previousOnlineStore) {
        queryClient.setQueryData(onlineStoreKeys.detail(id), context.previousOnlineStore);
      }
      if (context?.previousOnlineStores) {
        queryClient.setQueryData(onlineStoreKeys.lists(), context.previousOnlineStores);
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: onlineStoreKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: onlineStoreKeys.lists() });
    },
    meta: { toast: { success: "OnlineStores.success.update", error: "OnlineStores.error.update" } },
  });
}

// Hook for duplicating an online store
export function useDuplicateOnlineStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateOnlineStore(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: onlineStoreKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: onlineStoreKeys.lists() });
    },
    meta: {
      toast: { success: "OnlineStores.success.duplicate", error: "OnlineStores.error.duplicate" },
    },
  });
}

// Hook for deleting an online store
export function useDeleteOnlineStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOnlineStore(id),
    onSuccess: (_, variables) => {
      // Invalidate the list and remove the specific detail query from cache
      queryClient.invalidateQueries({ queryKey: onlineStoreKeys.lists() });
      queryClient.removeQueries({ queryKey: onlineStoreKeys.detail(variables) });
    },
    meta: { toast: { success: "OnlineStores.success.delete", error: "OnlineStores.error.delete" } },
  });
}

export function useBulkDeleteOnlineStores() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteOnlineStores,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: onlineStoreKeys.lists() }),
    meta: { toast: { success: "OnlineStores.success.delete", error: "OnlineStores.error.delete" } },
  });
}
