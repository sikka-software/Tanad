import { useQuery } from "@tanstack/react-query";

import { Employee } from "@/api/employees";

async function fetchEmployees(): Promise<Employee[]> {
  const response = await fetch("/api/employees");
  if (!response.ok) {
    throw new Error("Failed to fetch employees");
  }
  const data = await response.json();
  return data.employees;
}

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });
}
