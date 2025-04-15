import { create } from "zustand";

import { supabase } from "@/lib/supabase";
import { Office } from "@/types/office.type";

interface OfficesStore {
  offices: Office[];
  isLoading: boolean;
  error: Error | null;
  fetchOffices: () => Promise<void>;
  updateOffice: (id: string, updates: Partial<Office>) => Promise<void>;
  addOffice: (office: Omit<Office, "id" | "created_at">) => Promise<void>;
  deleteOffice: (id: string) => Promise<void>;
}

export const useOfficesStore = create<OfficesStore>((set, get) => ({
  offices: [],
  isLoading: false,
  error: null,

  fetchOffices: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.from("offices").select("*");
      if (error) throw error;
      set({ offices: data as Office[], isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },

  updateOffice: async (id: string, updates: Partial<Office>) => {
    try {
      const { error } = await supabase
        .from("offices")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      await get().fetchOffices();
    } catch (error) {
      set({ error: error as Error });
    }
  },

  addOffice: async (office) => {
    try {
      const { error } = await supabase.from("offices").insert([office]);
      if (error) throw error;
      await get().fetchOffices();
    } catch (error) {
      set({ error: error as Error });
    }
  },

  deleteOffice: async (id: string) => {
    try {
      const { error } = await supabase.from("offices").delete().eq("id", id);
      if (error) throw error;
      await get().fetchOffices();
    } catch (error) {
      set({ error: error as Error });
    }
  },
})); 