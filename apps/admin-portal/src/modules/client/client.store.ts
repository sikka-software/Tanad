import { create } from "zustand";

import { applyFilters } from "@/lib/filter-utils";
import { applySort } from "@/lib/sort-utils";

import { FilterCondition } from "@/types/common.type";

import { Client } from "@/modules/client/client.type";
import { createClient } from "@/utils/supabase/component";

type ClientStates = {
  clients: Client[];
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

type ClientActions = {
  fetchClients: () => Promise<void>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
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
  getFilteredClients: (data: Client[]) => Client[];
  getSortedClients: (data: Client[]) => Client[];
};

export const useClientsStore = create<ClientStates & ClientActions>((set, get) => ({
  clients: [],
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

  getFilteredClients: (data: Client[]) => {
    const { searchQuery, filterConditions, filterCaseSensitive } = get();

    // If no data, return empty array
    if (!data || data.length === 0) {
      return [];
    }

    // First apply search if there is a search query
    let filtered = data;
    if (searchQuery) {
      filtered = filtered.filter((client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Then apply other filters if there are any
    if (filterConditions.length > 0) {
      filtered = applyFilters(filtered, filterConditions, filterCaseSensitive);
    }

    return filtered;
  },

  getSortedClients: (data: Client[]) => {
    const { sortRules, sortCaseSensitive, sortNullsFirst } = get();

    return applySort("clients", data, sortRules, {
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
  fetchClients: async () => {
    const supabase = createClient();
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) throw error;
      set({ clients: data as Client[], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateClient: async (id: string, updates: Partial<Client>) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from("clients").update(updates).eq("id", id);

      if (error) throw error;

      set((state) => ({
        clients: state.clients.map((client) =>
          client.id === id ? { ...client, ...updates } : client,
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
