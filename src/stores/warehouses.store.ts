import { create } from "zustand";

import { supabase } from "@/lib/supabase";
import { Warehouse } from "@/types/warehouse.type";

interface WarehousesState {
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => Promise<void>;
}

export const useWarehousesStore = create<WarehousesState>((set) => ({
  updateWarehouse: async (id: string, updates: Partial<Warehouse>) => {
    const { error } = await supabase.from("warehouses").update(updates).eq("id", id);

    if (error) {
      throw new Error(`Failed to update warehouse: ${error.message}`);
    }
  },
}));
