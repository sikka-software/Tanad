import { useEffect } from "react";

import { useEmployeeRequestsStore } from "@/stores/employee-requests.store";

export const employeeRequestKeys = {
  all: ["employeeRequests"] as const,
  lists: () => [...employeeRequestKeys.all, "list"] as const,
  list: (filters: any) => [...employeeRequestKeys.lists(), { filters }] as const,
  details: () => [...employeeRequestKeys.all, "detail"] as const,
  detail: (id: string) => [...employeeRequestKeys.details(), id] as const,
};

export function useEmployeeRequests() {
  const store = useEmployeeRequestsStore();

  useEffect(() => {
    store.fetchRequests();
  }, []);

  return {
    data: store.requests,
    isLoading: store.isLoading,
    error: store.error,
  };
}
