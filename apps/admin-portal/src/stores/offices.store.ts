import { create } from "zustand";

import { supabase } from "@/lib/supabase";
import { Office } from "@/types/office.type";

interface OfficesStore {
  offices: Office[];
  isLoading: boolean;
  error: string | null;
  fetchOffices: () => Promise<void>;
  updateOffice: (id: string, updates: Partial<Office>) => Promise<void>;
}

export const useOfficesStore = create<OfficesStore>((set) => ({
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
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateOffice: async (id: string, updates: Partial<Office>) => {
    try {
      const { error } = await supabase.from("offices").update(updates).eq("id", id);

      if (error) throw error;

      set((state) => ({
        offices: state.offices.map((office) =>
          office.id === id ? { ...office, ...updates } : office,
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
