import { create } from "zustand";

import { Warehouse } from "@/types/warehouse.type";

import { createClient } from "@/utils/supabase/component";

interface WarehousesState {
  selectedRows: string[];
  setSelectedRows: (ids: string[]) => void;
  clearSelection: () => void;
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
  bulkDeleteWarehouses: (ids: string[]) => Promise<void>;
}

const useWarehousesStore = create<WarehousesState>((set) => ({
  selectedRows: [],

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
    set((state) => {
      // Only update if there are actually selected rows
      if (state.selectedRows.length === 0) {
        return state;
      }
      return { ...state, selectedRows: [] };
    });
  },

  updateWarehouse: async (id: string, updates: Partial<Warehouse>) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from("warehouses").update(updates).eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating warehouse:", error);
      throw error;
    }
  },

  deleteWarehouse: async (id: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from("warehouses").delete().eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      throw error;
    }
  },

  bulkDeleteWarehouses: async (ids: string[]) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from("warehouses").delete().in("id", ids);

      if (error) throw error;
    } catch (error) {
      console.error("Error bulk deleting warehouses:", error);
      throw error;
    }
  },
}));

export default useWarehousesStore;
