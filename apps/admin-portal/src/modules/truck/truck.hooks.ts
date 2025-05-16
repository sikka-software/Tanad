import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import {
  createTruck,
  fetchTruckById,
  fetchTrucks,
  updateTruck,
  duplicateTruck,
} from "@/modules/truck/truck.service";
import type { TruckCreateData, TruckUpdateData } from "@/modules/truck/truck.type";

export const truckKeys = {
  all: ["trucks"] as const,
  lists: () => [...truckKeys.all, "list"] as const,
  list: (filters: any) => [...truckKeys.lists(), { filters }] as const,
  details: () => [...truckKeys.all, "detail"] as const,
  detail: (id: string) => [...truckKeys.details(), id] as const,
};

export function useTrucks() {
  return useQuery({
    queryKey: truckKeys.lists(),
    queryFn: fetchTrucks,
  });
}

// Hook to fetch a single truck by ID
export function useTruck(id: string) {
  return useQuery({
    queryKey: truckKeys.detail(id),
    queryFn: () => fetchTruckById(id),
    enabled: !!id, // Only run query if id is truthy
  });
}

// Hook for creating a new truck
export function useCreateTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTruck: TruckCreateData) => createTruck(newTruck),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: truckKeys.lists() }),
    meta: { toast: { success: "Trucks.success.create", error: "Trucks.error.create" } },
  });
}

// Hook for updating an existing truck
export function useUpdateTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TruckUpdateData }) => updateTruck(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: truckKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: truckKeys.lists() });
    },
    meta: { toast: { success: "Trucks.success.update", error: "Trucks.error.update" } },
  });
}

// Hook for duplicating a truck
export function useDuplicateTruck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateTruck(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: truckKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: truckKeys.lists() });
    },
    meta: { toast: { success: "Trucks.success.duplicate", error: "Trucks.error.duplicate" } },
  });
}

// Hook for deleting a truck
export function useDeleteTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteResourceById(`/api/resource/trucks/${id}`),
    onSuccess: (_, variables) => {
      // Invalidate the list and remove the specific detail query from cache
      queryClient.invalidateQueries({ queryKey: truckKeys.lists() });
      queryClient.removeQueries({ queryKey: truckKeys.detail(variables) });
    },
    meta: { toast: { success: "Trucks.success.delete", error: "Trucks.error.delete" } },
  });
}

// Hook for bulk deleting trucks
export function useBulkDeleteTrucks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteResource("/api/resource/trucks", ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: truckKeys.lists() }),
    meta: { toast: { success: "Trucks.success.delete", error: "Trucks.error.delete" } },
  });
}
