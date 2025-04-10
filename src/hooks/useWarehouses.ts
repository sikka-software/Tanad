import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Warehouse, WarehouseCreateData } from "@/types/warehouse.type";
import {
  createWarehouse,
  deleteWarehouse,
  fetchWarehouseById,
  fetchWarehouses,
  updateWarehouse,
} from "@/services/warehouseService";

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
    mutationFn: (newWarehouse: Omit<Warehouse, 'id' | 'created_at'> & { user_id: string }) => {
      // Map user_id to userId for the service function
      const { user_id, ...rest } = newWarehouse;
      const warehouseData: WarehouseCreateData = {
        ...rest,
        userId: user_id,
      };
      return createWarehouse(warehouseData);
    },
    onSuccess: () => {
      // Invalidate the list query to refetch
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });
}

// Hook for updating an existing warehouse
export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      warehouse,
    }: {
      id: string;
      warehouse: Partial<Omit<Warehouse, "id" | "created_at">>;
    }) => updateWarehouse(id, warehouse),
    onSuccess: (data) => {
      // Invalidate both the specific detail and the list queries
      queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });
}

// Hook for deleting a warehouse
export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWarehouse(id),
    onSuccess: (_, variables) => {
      // Invalidate the list and remove the specific detail query from cache
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      queryClient.removeQueries({ queryKey: warehouseKeys.detail(variables) });
    },
  });
}
