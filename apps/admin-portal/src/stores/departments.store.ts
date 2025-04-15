import { create } from "zustand";

import { Department } from "@/types/department.type";

interface DepartmentsState {
  departments: Department[];
  isLoading: boolean;
  error: string | null;
  fetchDepartments: () => Promise<void>;
  updateDepartment: (id: string, updates: Partial<Department>) => Promise<void>;
}

export const useDepartmentsStore = create<DepartmentsState>((set) => ({
  departments: [],
  isLoading: false,
  error: null,

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

      set((state) => ({
        departments: state.departments.map((department) =>
          department.id === id ? updatedDepartment : department,
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
