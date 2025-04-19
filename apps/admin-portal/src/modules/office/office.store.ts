import { create } from "zustand";

import { Office } from "@/modules/office/office.type";

import { createClient } from "@/utils/supabase/component";

interface OfficesStore {
  offices: Office[];
  isLoading: boolean;
  error: string | null;
  selectedRows: string[];
  fetchOffices: () => Promise<void>;
  updateOffice: (id: string, updates: Partial<Office>) => Promise<void>;
  setSelectedRows: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useOfficesStore = create<OfficesStore>((set) => ({
  offices: [],
  isLoading: false,
  error: null,
  selectedRows: [],

  fetchOffices: async () => {
    const supabase = createClient();
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
    const supabase = createClient();
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

  setSelectedRows: (ids: string[]) => {
    set((state) => {
      // Only update if the selection has actually changed
      if (JSON.stringify(state.selectedRows) === JSON.stringify(ids)) {
        return state;
      }
      return { ...state, selectedRows: ids };
    });
  },

  clearSelection: () => {
    set({ selectedRows: [] });
  },
}));
