import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import {
  createVehicle,
  fetchVehicleById,
  fetchVehicles,
  updateVehicle,
  duplicateVehicle,
} from "@/vehicle/vehicle.service";
import type { VehicleCreateData, VehicleUpdateData } from "@/vehicle/vehicle.type";

export const vehicleKeys = {
  all: ["vehicles"] as const,
  lists: () => [...vehicleKeys.all, "list"] as const,
  list: (filters: any) => [...vehicleKeys.lists(), { filters }] as const,
  details: () => [...vehicleKeys.all, "detail"] as const,
  detail: (id: string) => [...vehicleKeys.details(), id] as const,
};

export function useVehicles() {
  return useQuery({
    queryKey: vehicleKeys.lists(),
    queryFn: fetchVehicles,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => fetchVehicleById(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newVehicle: VehicleCreateData) => createVehicle(newVehicle),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() }),
    meta: {
      operation: "create",
      toast: { success: "Vehicles.success.create", error: "Vehicles.error.create" },
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VehicleUpdateData }) => updateVehicle(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
    meta: {
      operation: "update",
      toast: { success: "Vehicles.success.update", error: "Vehicles.error.update" },
    },
  });
}

export function useDuplicateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateVehicle(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
    meta: {
      operation: "duplicate",
      toast: { success: "Vehicles.success.duplicate", error: "Vehicles.error.duplicate" },
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteResourceById(`/api/resource/vehicles/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.removeQueries({ queryKey: vehicleKeys.detail(variables) });
    },
    meta: {
      operation: "delete",
      toast: { success: "Vehicles.success.delete", error: "Vehicles.error.delete" },
    },
  });
}

export function useBulkDeleteVehicles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteResource("/api/resource/vehicles", ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() }),
    meta: {
      operation: "delete",
      toast: { success: "Vehicles.success.delete", error: "Vehicles.error.delete" },
    },
  });
}
