import { useEffect } from "react";

import { useEmployeeRequestsStore } from "@/stores/employee-requests.store";

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