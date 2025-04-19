import { create } from "zustand";

import { applyFilters } from "@/lib/filter-utils";
import { applySort } from "@/lib/sort-utils";

import { FilterCondition } from "@/types/common.type";
import { Company } from "@/modules/company/company.type";

type CompaniesStates = {
  companies: Company[];
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

type CompaniesActions = {
  updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
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
  getFilteredCompanies: (data: Company[]) => Company[];
  getSortedCompanies: (data: Company[]) => Company[];
};

const useCompanyStore = create<CompaniesStates & CompaniesActions>((set, get) => ({
  companies: [],
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

  getFilteredCompanies: (data: Company[]) => {
    const { searchQuery, filterConditions, filterCaseSensitive } = get();

    // If no data, return empty array
    if (!data || data.length === 0) {
      return [];
    }

    // First apply search if there is a search query
    let filtered = data;
    if (searchQuery) {
      filtered = filtered.filter((company) =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Then apply other filters if there are any
    if (filterConditions.length > 0) {
      filtered = applyFilters(filtered, filterConditions, filterCaseSensitive);
    }

    return filtered;
  },

  getSortedCompanies: (data: Company[]) => {
    const { sortRules, sortCaseSensitive, sortNullsFirst } = get();

    return applySort("companies", data, sortRules, {
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

  updateCompany: async (id: string, updates: Partial<Company>) => {
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update company");

      set((state) => ({
        companies: state.companies.map((company) =>
          company.id === id ? { ...company, ...updates } : company,
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
    set((state) => {
      // Only update if there are actually selected rows
      if (state.selectedRows.length === 0) {
        return state;
      }
      return { ...state, selectedRows: [] };
    });
  },
}));

export default useCompanyStore;
