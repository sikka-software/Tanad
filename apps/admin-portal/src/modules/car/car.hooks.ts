import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  createCar,
  deleteCar,
  fetchCarById,
  fetchCars,
  updateCar,
  bulkDeleteCars,
  duplicateCar,
} from "@/modules/car/car.service";
import type { Car, CarCreateData, CarUpdateData } from "@/modules/car/car.type";

// Query keys for cars
export const carKeys = {
  all: ["cars"] as const,
  lists: () => [...carKeys.all, "list"] as const,
  list: (filters: any) => [...carKeys.lists(), { filters }] as const,
  details: () => [...carKeys.all, "detail"] as const,
  detail: (id: string) => [...carKeys.details(), id] as const,
};

// Hook to fetch all cars
export function useCars() {
  return useQuery({
    queryKey: carKeys.lists(),
    queryFn: fetchCars,
  });
}

// Hook to fetch a single car by ID
export function useCar(id: string) {
  return useQuery({
    queryKey: carKeys.detail(id),
    queryFn: () => fetchCarById(id),
    enabled: !!id, // Only run query if id is truthy
  });
}

// Hook for creating a new car
export function useCreateCar() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: (newCar: CarCreateData) => createCar(newCar),
    onSuccess: () => {
      // Invalidate the list query to refetch
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
    },
  });
}

// Hook for updating an existing car
export function useUpdateCar() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CarUpdateData }) => updateCar(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: carKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
    },
  });
}

// Hook for duplicating a car
export function useDuplicateCar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateCar(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: carKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
    },
  });
}

// Hook for deleting a car
export function useDeleteCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCar(id),
    onSuccess: (_, variables) => {
      // Invalidate the list and remove the specific detail query from cache
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
      queryClient.removeQueries({ queryKey: carKeys.detail(variables) });
    },
  });
}

// Hook for bulk deleting cars
export function useBulkDeleteCars() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteCars,
    onSuccess: () => {
      // Invalidate the list query
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
    },
  });
}
