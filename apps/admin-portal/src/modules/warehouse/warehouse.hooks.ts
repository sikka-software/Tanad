import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import {
  createWarehouse,
  fetchWarehouseById,
  fetchWarehouses,
  updateWarehouse,
  duplicateWarehouse,
} from "@/warehouse/warehouse.service";
import type {
  Warehouse,
  WarehouseCreateData,
  WarehouseUpdateData,
} from "@/warehouse/warehouse.type";

// Query keys for warehouses
export const warehouseKeys = {
  all: ["warehouses"] as const,
  lists: () => [...warehouseKeys.all, "list"] as const,
  list: (filters: any) => [...warehouseKeys.lists(), { filters }] as const,
  details: () => [...warehouseKeys.all, "detail"] as const,
  detail: (id: string) => [...warehouseKeys.details(), id] as const,
};

// Hook to fetch all warehouses
export function useWarehouses() {
  return useQuery({
    queryKey: warehouseKeys.lists(),
    queryFn: fetchWarehouses,
  });
}

// Hook to fetch a single warehouse by ID
export function useWarehouse(id: string) {
  return useQuery({
    queryKey: warehouseKeys.detail(id),
    queryFn: () => fetchWarehouseById(id),
    enabled: !!id, // Only run query if id is truthy
  });
}

// Hook for creating a new warehouse
export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newWarehouse: WarehouseCreateData) => createWarehouse(newWarehouse),
    onSuccess: (newWarehouse: Warehouse) => {
      const previousWarehouses = queryClient.getQueryData(warehouseKeys.lists()) || [];
      queryClient.setQueryData(warehouseKeys.lists(), [
        ...(Array.isArray(previousWarehouses) ? previousWarehouses : []),
        newWarehouse,
      ]);
    },
    meta: { toast: { success: "Warehouses.success.create", error: "Warehouses.error.create" } },
  });
}

export function useDuplicateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateWarehouse(id),
    onSuccess: (newWarehouse: Warehouse) => {
      const previousWarehouses = queryClient.getQueryData(warehouseKeys.lists()) || [];
      queryClient.setQueryData(warehouseKeys.lists(), [
        ...(Array.isArray(previousWarehouses) ? previousWarehouses : []),
        newWarehouse,
      ]);
      queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(newWarehouse.id) });
    },
    meta: {
      toast: { success: "Warehouses.success.duplicate", error: "Warehouses.error.duplicate" },
    },
  });
}

// Hook for updating an existing warehouse
export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WarehouseUpdateData }) =>
      updateWarehouse(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: warehouseKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: warehouseKeys.lists() });

      // Snapshot the previous value
      const previousWarehouse = queryClient.getQueryData<Warehouse>(warehouseKeys.detail(id));
      const previousWarehouses = queryClient.getQueryData<Warehouse[]>(warehouseKeys.lists());

      // Optimistically update to the new value
      // Update detail cache
      if (previousWarehouse) {
        queryClient.setQueryData<Warehouse>(warehouseKeys.detail(id), {
          ...previousWarehouse,
          ...data,
          // Ensure created_at is preserved if not part of the update
          created_at: previousWarehouse.created_at,
        });
      }

      // Update list cache
      if (previousWarehouses) {
        queryClient.setQueryData<Warehouse[]>(
          warehouseKeys.lists(),
          previousWarehouses.map((warehouse) =>
            warehouse.id === id
              ? { ...warehouse, ...data, created_at: warehouse.created_at } // Preserve created_at here too
              : warehouse,
          ),
        );
      }

      // Return a context object with the snapshotted value
      return { previousWarehouse, previousWarehouses };
    },
    onError: (err, { id }, context) => {
      console.error("Update failed:", err);
      if (context?.previousWarehouse) {
        queryClient.setQueryData(warehouseKeys.detail(id), context.previousWarehouse);
      }
      if (context?.previousWarehouses) {
        queryClient.setQueryData(warehouseKeys.lists(), context.previousWarehouses);
      }
    },
    onSettled: (data, error, { id }) => {
      // Invalidate queries to ensure eventual consistency
      queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
    meta: { toast: { success: "Warehouses.success.update", error: "Warehouses.error.update" } },
  });
}

// Hook for deleting a warehouse
export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteResourceById(`/api/resource/warehouses/${id}`),
    onSuccess: (_, variables) => {
      // Invalidate the list and remove the specific detail query from cache
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      queryClient.removeQueries({ queryKey: warehouseKeys.detail(variables) });
    },
    meta: { toast: { success: "Warehouses.success.delete", error: "Warehouses.error.delete" } },
  });
}

export function useBulkDeleteWarehouses() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteResource("/api/resource/warehouses", ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
    meta: { toast: { success: "Warehouses.success.delete", error: "Warehouses.error.delete" } },
  });
}
