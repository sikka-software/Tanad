import { create } from "zustand";

import { Department } from "@/modules/department/department.type";

interface DepartmentsState {
  departments: Department[];
  isLoading: boolean;
  error: string | null;
  selectedRows: string[];
  fetchDepartments: () => Promise<void>;
  updateDepartment: (id: string, updates: Partial<Department>) => Promise<void>;
  setSelectedRows: (rows: string[]) => void;
  clearSelection: () => void;
}

export const useDepartmentsStore = create<DepartmentsState>((set, get) => ({
  departments: [],
  isLoading: false,
  error: null,
  selectedRows: [],

  fetchDepartments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/departments");
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }
      const data = await response.json();
      set({ departments: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateDepartment: async (id: string, updates: Partial<Department>) => {
    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update department with id ${id}`);
      }

      const updatedDepartment = await response.json();

      // Update the local state immediately
      set((state) => ({
        departments: state.departments.map((department) =>
          department.id === id ? updatedDepartment : department,
        ),
      }));

      // Refetch to ensure we have the latest data
      await get().fetchDepartments();
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
