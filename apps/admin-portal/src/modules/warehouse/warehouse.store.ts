import { create } from "zustand";

import { applyFilters } from "@/lib/filter-utils";
import { applySort } from "@/lib/sort-utils";

import { FilterCondition } from "@/types/common.type";

import { createClient } from "@/utils/supabase/component";

import { Warehouse } from "./warehouse.type";

type WarehouseStates = {
  warehouses: Warehouse[];
  isLoading: boolean;
  error: string | null;
  selectedRows: string[];
  filterConditions: FilterCondition[];
  filterCaseSensitive: boolean;
  searchQuery: string;
  viewMode: "table" | "cards";
  isDeleteDialogOpen: boolean;
  sortRules: { field: string; direction: string }[];
  sortCaseSensitive: boolean;
  sortNullsFirst: boolean;
};

type WarehouseActions = {
  updateWarehouse: (id: string, data: Partial<Warehouse>) => Promise<void>;
  setSelectedRows: (ids: string[]) => void;
  clearSelection: () => void;
  setFilterConditions: (filterConditions: FilterCondition[]) => void;
  setFilterCaseSensitive: (filterCaseSensitive: boolean) => void;
  setSearchQuery: (searchQuery: string) => void;
  setViewMode: (viewMode: "table" | "cards") => void;
  setIsDeleteDialogOpen: (isDeleteDialogOpen: boolean) => void;
  setSortRules: (sortRules: { field: string; direction: string }[]) => void;
  setSortCaseSensitive: (sortCaseSensitive: boolean) => void;
  setSortNullsFirst: (sortNullsFirst: boolean) => void;
  getFilteredWarehouses: (data: Warehouse[]) => Warehouse[];
  getSortedWarehouses: (data: Warehouse[]) => Warehouse[];
};

export const useWarehousesStore = create<WarehouseStates & WarehouseActions>((set, get) => ({
  warehouses: [],
  isLoading: false,
  error: null,
  selectedRows: [],

  filterConditions: [],
  filterCaseSensitive: false,
  searchQuery: "",
  viewMode: "table",
  isDeleteDialogOpen: false,
  sortRules: [],
  sortCaseSensitive: false,
  sortNullsFirst: false,

  getFilteredWarehouses: (data: Warehouse[]) => {
    const { searchQuery, filterConditions, filterCaseSensitive } = get();

    // If no data, return empty array
    if (!data || data.length === 0) {
      return [];
    }

    // First apply search if there is a search query
    let filtered = data;
    if (searchQuery) {
      filtered = filtered.filter((warehouse) =>
        warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Then apply other filters if there are any
    if (filterConditions.length > 0) {
      filtered = applyFilters(filtered, filterConditions, filterCaseSensitive);
    }

    return filtered;
  },

  getSortedWarehouses: (data: Warehouse[]) => {
    const { sortRules, sortCaseSensitive, sortNullsFirst } = get();

    return applySort("warehouses", data, sortRules, {
      caseSensitive: sortCaseSensitive,
      nullsFirst: sortNullsFirst,
    });
  },
  setSortRules: (sortRules: { field: string; direction: string }[]) => {
    set({ sortRules });
  },

  setSortCaseSensitive: (sortCaseSensitive: boolean) => {
    set({ sortCaseSensitive });
  },

  setSortNullsFirst: (sortNullsFirst: boolean) => {
    set({ sortNullsFirst });
  },

  setFilterConditions: (filterConditions: FilterCondition[]) => {
    set({ filterConditions });
  },

  setFilterCaseSensitive: (filterCaseSensitive: boolean) => {
    set({ filterCaseSensitive });
  },

  setSearchQuery: (searchQuery: string) => {
    set({ searchQuery });
  },

  setViewMode: (viewMode: "table" | "cards") => {
    set({ viewMode });
  },

  setIsDeleteDialogOpen: (isDeleteDialogOpen: boolean) => {
    set({ isDeleteDialogOpen });
  },
  setSelectedRows: (ids: string[]) => {
    set((state) => {
      if (JSON.stringify(state.selectedRows) === JSON.stringify(ids)) {
        return state;
      }
      return { ...state, selectedRows: ids };
    });
  },

  clearSelection: () => {
    set((state) => {
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
