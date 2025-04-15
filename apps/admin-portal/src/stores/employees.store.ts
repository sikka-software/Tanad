import { create } from "zustand";

import { supabase } from "@/lib/supabase";
import { Employee } from "@/types/employee.type";

interface EmployeesStore {
  employees: Employee[];
  isLoading: boolean;
  error: Error | null;
  fetchEmployees: () => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  addEmployee: (employee: Omit<Employee, "id" | "created_at" | "updated_at">) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
}

export const useEmployeesStore = create<EmployeesStore>((set, get) => ({
  employees: [],
  isLoading: false,
  error: null,

  fetchEmployees: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.from("employees").select(`
          *,
          department:departments (
            name
          )
        `);
      if (error) throw error;

      // Transform the data to match our Employee type
      const transformedData = data.map((employee: any) => ({
        ...employee,
        department: employee.department?.name || null,
      }));

      set({ employees: transformedData as Employee[], isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },

  updateEmployee: async (id: string, updates: Partial<Employee>) => {
    try {
      const { error } = await supabase.from("employees").update(updates).eq("id", id);
      if (error) throw error;
      await get().fetchEmployees();
    } catch (error) {
      set({ error: error as Error });
    }
  },

  addEmployee: async (employee) => {
    try {
      const { error } = await supabase.from("employees").insert([employee]);
      if (error) throw error;
      await get().fetchEmployees();
    } catch (error) {
      set({ error: error as Error });
    }
  },

  deleteEmployee: async (id: string) => {
    try {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
      await get().fetchEmployees();
    } catch (error) {
      set({ error: error as Error });
    }
  },
}));
