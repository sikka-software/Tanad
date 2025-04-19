import { create } from "zustand";

import { applyFilters } from "@/lib/filter-utils";
import { applySort } from "@/lib/sort-utils";

import { FilterCondition } from "@/types/common.type";

import { Department } from "./department.type";

type DepartmentStates = {
  departments: Department[];
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

type DepartmentActions = {
  fetchDepartments: () => Promise<void>;
  updateDepartment: (id: string, data: Partial<Department>) => Promise<void>;
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
  getFilteredDepartments: (data: Department[]) => Department[];
  getSortedDepartments: (data: Department[]) => Department[];
};

export const useDepartmentsStore = create<DepartmentStates & DepartmentActions>((set, get) => ({
  departments: [],
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

  getFilteredDepartments: (data: Department[]) => {
    const { searchQuery, filterConditions, filterCaseSensitive } = get();

    // If no data, return empty array
    if (!data || data.length === 0) {
      return [];
    }

    // First apply search if there is a search query
    let filtered = data;
    if (searchQuery) {
      filtered = filtered.filter((department) =>
        department.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Then apply other filters if there are any
    if (filterConditions.length > 0) {
      filtered = applyFilters(filtered, filterConditions, filterCaseSensitive);
    }

    return filtered;
  },

  getSortedDepartments: (data: Department[]) => {
    const { sortRules, sortCaseSensitive, sortNullsFirst } = get();

    return applySort("departments", data, sortRules, {
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

  fetchDepartments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/departments");
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }
      const data = await response.json();
      set({ departments: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateDepartment: async (id: string, updates: Partial<Department>) => {
    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update department with id ${id}`);
      }

      const updatedDepartment = await response.json();

      // Update the local state immediately
      set((state) => ({
        departments: state.departments.map((department) =>
          department.id === id ? updatedDepartment : department,
        ),
      }));

      // Refetch to ensure we have the latest data
      await get().fetchDepartments();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
