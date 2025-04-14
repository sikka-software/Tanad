import { useEffect } from "react";

import { useEmployeesStore } from "@/stores/employees.store";

export const useEmployees = () => {
  const { employees, isLoading, error, fetchEmployees } = useEmployeesStore();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    data: employees,
    isLoading,
    error,
  };
};
