import { create } from "zustand";

import { EmployeeRequest } from "@/modules/employee-request/employee-request.type";

import { createClient } from "@/utils/supabase/component";

interface EmployeeRequestsStore {
  requests: EmployeeRequest[];
  isLoading: boolean;
  error: Error | null;
  fetchRequests: () => Promise<void>;
  updateRequest: (id: string, updates: Partial<EmployeeRequest>) => Promise<void>;
  addRequest: (request: Omit<EmployeeRequest, "id" | "created_at" | "updated_at">) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  setLoadingSave: (loading: boolean) => void;
  loadingSave: boolean;
}

export const useEmployeeRequestsStore = create<EmployeeRequestsStore>((set, get) => ({
  requests: [],
  isLoading: false,
  error: null,

  fetchRequests: async () => {
    const supabase = createClient();
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
    const supabase = createClient();
    try {
      const { error } = await supabase.from("employee_requests").update(updates).eq("id", id);
      if (error) throw error;
      await get().fetchRequests();
    } catch (error) {
      set({ error: error as Error });
    }
  },

  addRequest: async (request) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from("employee_requests").insert([request]);
      if (error) throw error;
      await get().fetchRequests();
    } catch (error) {
      set({ error: error as Error });
    }
  },

  deleteRequest: async (id: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from("employee_requests").delete().eq("id", id);
      if (error) throw error;
      await get().fetchRequests();
    } catch (error) {
      set({ error: error as Error });
    }
  },
  setLoadingSave: (loading: boolean) => set({ loadingSave: loading }),
  loadingSave: false,
}));
