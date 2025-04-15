import { useQuery } from "@tanstack/react-query";

import { Office } from "@/types/office.type";

async function fetchOffices(): Promise<Office[]> {
  const response = await fetch("/api/offices");
  if (!response.ok) {
    throw new Error("Failed to fetch offices");
  }
  return response.json();
}

export function useOffices() {
  return useQuery({
    queryKey: ["offices"],
    queryFn: fetchOffices,
  });
}

async function fetchOffice(id: string): Promise<Office> {
  const response = await fetch(`/api/offices/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch office");
  }
  return response.json();
}

export function useOffice(id: string) {
  return useQuery({
    queryKey: ["offices", id],
    queryFn: () => fetchOffice(id),
    enabled: !!id,
  });
}
