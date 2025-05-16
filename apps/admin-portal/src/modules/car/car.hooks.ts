import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import {
  createCar,
  fetchCarById,
  fetchCars,
  updateCar,
  duplicateCar,
} from "@/modules/car/car.service";
import type { CarCreateData, CarUpdateData } from "@/modules/car/car.type";

export const carKeys = {
  all: ["cars"] as const,
  lists: () => [...carKeys.all, "list"] as const,
  list: (filters: any) => [...carKeys.lists(), { filters }] as const,
  details: () => [...carKeys.all, "detail"] as const,
  detail: (id: string) => [...carKeys.details(), id] as const,
};

export function useCars() {
  return useQuery({
    queryKey: carKeys.lists(),
    queryFn: fetchCars,
  });
}

export function useCar(id: string) {
  return useQuery({
    queryKey: carKeys.detail(id),
    queryFn: () => fetchCarById(id),
    enabled: !!id,
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newCar: CarCreateData) => createCar(newCar),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: carKeys.lists() }),
    meta: { toast: { success: "Cars.success.create", error: "Cars.error.create" } },
  });
}

export function useUpdateCar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CarUpdateData }) => updateCar(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: carKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
    },
    meta: { toast: { success: "Cars.success.update", error: "Cars.error.update" } },
  });
}

export function useDuplicateCar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateCar(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: carKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
    },
    meta: { toast: { success: "Cars.success.duplicate", error: "Cars.error.duplicate" } },
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteResourceById(`/api/resource/cars/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
      queryClient.removeQueries({ queryKey: carKeys.detail(variables) });
    },
    meta: { toast: { success: "Cars.success.delete", error: "Cars.error.delete" } },
  });
}

export function useBulkDeleteCars() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteResource("/api/resource/cars", ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: carKeys.lists() }),
    meta: { toast: { success: "Cars.success.delete", error: "Cars.error.delete" } },
  });
}
