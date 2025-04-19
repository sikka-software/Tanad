import { create } from "zustand";

import { applyFilters } from "@/lib/filter-utils";
import { applySort } from "@/lib/sort-utils";

import { FilterCondition } from "@/types/common.type";

import { deleteSalary, updateSalary as updateSalaryService } from "@/modules/salary/salary.service";
import { Salary } from "@/modules/salary/salary.type";

type SalaryStates = {
  salaries: Salary[];
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

type SalaryActions = {
  updateSalary: (id: string, data: Partial<Salary>) => Promise<void>;
  deleteSalary: (id: string) => Promise<void>;
  bulkDeleteSalaries: (ids: string[]) => Promise<void>;
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
  getFilteredSalaries: (data: Salary[]) => Salary[];
  getSortedSalaries: (data: Salary[]) => Salary[];
};

export const useSalaryStore = create<SalaryStates & SalaryActions>((set, get) => ({
  salaries: [],
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

  getFilteredSalaries: (data: Salary[]) => {
    const { searchQuery, filterConditions, filterCaseSensitive } = get();

    // If no data, return empty array
    if (!data || data.length === 0) {
      return [];
    }

    // First apply search if there is a search query
    let filtered = data;
    if (searchQuery) {
      filtered = filtered.filter((salary) =>
        salary.employee_name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Then apply other filters if there are any
    if (filterConditions.length > 0) {
      filtered = applyFilters(filtered, filterConditions, filterCaseSensitive);
    }

    return filtered;
  },

  getSortedSalaries: (data: Salary[]) => {
    const { sortRules, sortCaseSensitive, sortNullsFirst } = get();

    return applySort("salaries", data, sortRules, {
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

  updateSalary: async (id: string, data: Partial<Salary>) => {
    try {
      await updateSalaryService(id, data);
    } catch (error) {
      console.error("Failed to update salary:", error);
      throw error;
    }
  },

  deleteSalary: async (id: string) => {
    try {
      await deleteSalary(id);
    } catch (error) {
      console.error("Failed to delete salary:", error);
      throw error;
    }
  },

  bulkDeleteSalaries: async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => deleteSalary(id)));
    } catch (error) {
      console.error("Failed to delete salaries:", error);
      throw error;
    }
  },
}));
