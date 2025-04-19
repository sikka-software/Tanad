import { create } from "zustand";

import { applyFilters } from "@/lib/filter-utils";
import { applySort } from "@/lib/sort-utils";

import { FilterCondition } from "@/types/common.type";

import { Quote } from "@/modules/quote/quote.type";
import { createClient } from "@/utils/supabase/component";

type QuoteStates = {
  quotes: Quote[];
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

type QuoteActions = {
  fetchQuotes: () => Promise<void>;
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<void>;
  deleteQuotes: (ids: string[]) => Promise<void>;
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
  getFilteredQuotes: (data: Quote[]) => Quote[];
  getSortedQuotes: (data: Quote[]) => Quote[];
};

export const useQuotesStore = create<QuoteStates & QuoteActions>((set, get) => ({
  quotes: [],
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

  getFilteredQuotes: (data: Quote[]) => {
    const { searchQuery, filterConditions, filterCaseSensitive } = get();

    // If no data, return empty array
    if (!data || data.length === 0) {
      return [];
    }

    // First apply search if there is a search query
    let filtered = data;
    if (searchQuery) {
      filtered = filtered.filter((quote) =>
        // make it search in any column (except id)
        Object.values(quote).some((value) =>
          value.toString().toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    }

    // Then apply other filters if there are any
    if (filterConditions.length > 0) {
      filtered = applyFilters(filtered, filterConditions, filterCaseSensitive);
    }

    return filtered;
  },

  getSortedQuotes: (data: Quote[]) => {
    const { sortRules, sortCaseSensitive, sortNullsFirst } = get();

    return applySort("quotes", data, sortRules, {
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

  fetchQuotes: async () => {
    const supabase = createClient();
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.from("quotes").select("*");
      if (error) throw error;
      set({ quotes: data as Quote[], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setSelectedRows: (rows) => {
    set((state) => {
      if (JSON.stringify(state.selectedRows) === JSON.stringify(rows)) {
        return state;
      }
      return { selectedRows: rows };
    });
  },
  clearSelection: () => set({ selectedRows: [] }),
  updateQuote: async (id: string, updates: Partial<Quote>) => {
    const supabase = createClient();
    const { error } = await supabase.from("quotes").update(updates).eq("id", id);

    if (error) {
      throw new Error(`Failed to update quote: ${error.message}`);
    }
  },
  deleteQuotes: async (ids: string[]) => {
    const supabase = createClient();
    const { error } = await supabase.from("quotes").delete().in("id", ids);

    if (error) {
      throw new Error(`Failed to delete quotes: ${error.message}`);
    }
  },
}));
