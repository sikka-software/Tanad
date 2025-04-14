import { create } from "zustand";

import { supabase } from "@/lib/supabase";
import { EmployeeRequest } from "@/types/employee-request.type";

interface EmployeeRequestsStore {
  requests: EmployeeRequest[];
  isLoading: boolean;
  error: Error | null;
  fetchRequests: () => Promise<void>;
  updateRequest: (id: string, updates: Partial<EmployeeRequest>) => Promise<void>;
  addRequest: (request: Omit<EmployeeRequest, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
}

export const useEmployeeRequestsStore = create<EmployeeRequestsStore>((set, get) => ({
  requests: [],
  isLoading: false,
  error: null,

  fetchRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.from("employee_requests").select("*");
      if (error) throw error;
      set({ requests: data as EmployeeRequest[], isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },

  updateRequest: async (id: string, updates: Partial<EmployeeRequest>) => {
    try {
      const { error } = await supabase
        .from("employee_requests")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      await get().fetchRequests();
    } catch (error) {
      set({ error: error as Error });
    }
  },

  addRequest: async (request) => {
    try {
      const { error } = await supabase.from("employee_requests").insert([request]);
      if (error) throw error;
      await get().fetchRequests();
    } catch (error) {
      set({ error: error as Error });
    }
  },

  deleteRequest: async (id: string) => {
    try {
      const { error } = await supabase.from("employee_requests").delete().eq("id", id);
      if (error) throw error;
      await get().fetchRequests();
    } catch (error) {
      set({ error: error as Error });
    }
  },
})); 