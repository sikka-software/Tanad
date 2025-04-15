import { create } from "zustand";

import { supabase } from "@/lib/supabase";
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
      const { data, error } = await supabase.from("departments").select("*");
      if (error) throw error;
      set({ departments: data as Department[], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateDepartment: async (id: string, updates: Partial<Department>) => {
    try {
      const { error } = await supabase.from("departments").update(updates).eq("id", id);

      if (error) throw error;

      set((state) => ({
        departments: state.departments.map((department) =>
          department.id === id ? { ...department, ...updates } : department,
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
