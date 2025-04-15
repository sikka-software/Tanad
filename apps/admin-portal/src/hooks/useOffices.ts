import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createOffice,
  deleteOffice,
  fetchOfficeById,
  fetchOffices,
  updateOffice,
} from "@/services/officeService";
import { Office, OfficeCreateData } from "@/types/office.type";

// Hooks
export function useOffices() {
  return useQuery({
    queryKey: ["offices"],
    queryFn: fetchOffices,
  });
}

export function useOffice(id: string) {
  return useQuery({
    queryKey: ["offices", id],
    queryFn: () => fetchOfficeById(id),
    enabled: !!id,
  });
}

export function useCreateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newOffice: Omit<Office, "id" | "created_at">) =>
      createOffice(newOffice as OfficeCreateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
    },
  });
}

export function useUpdateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      office,
    }: {
      id: string;
      office: Partial<Omit<Office, "id" | "created_at">>;
    }) => updateOffice(id, office),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["offices", data.id] });
      queryClient.invalidateQueries({ queryKey: ["offices"] });
    },
  });
}

export function useDeleteOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOffice(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      queryClient.removeQueries({ queryKey: ["offices", variables] });
    },
  });
}
