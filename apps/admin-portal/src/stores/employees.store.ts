import { create } from "zustand";

import { Employee } from "@/types/employee.type";

interface EmployeesState {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  selectedRows: string[];
  fetchEmployees: () => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  setSelectedRows: (rows: string[]) => void;
  clearSelection: () => void;
}

export const useEmployeesStore = create<EmployeesState>((set, get) => ({
  employees: [],
  isLoading: false,
  error: null,
  selectedRows: [],

  fetchEmployees: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/employees");
      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      const data = await response.json();
      set({ employees: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateEmployee: async (id: string, updates: Partial<Employee>) => {
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update employee with id ${id}`);
      }

      const updatedEmployee = await response.json();

      // Update the local state immediately
      set((state) => ({
        employees: state.employees.map((employee) =>
          employee.id === id ? updatedEmployee : employee,
        ),
      }));

      // Refetch to ensure we have the latest data
      await get().fetchEmployees();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  setSelectedRows: (rows: string[]) => {
    set({ selectedRows: rows });
  },

  clearSelection: () => {
    set({ selectedRows: [] });
  },
}));
