import { create } from "zustand";

import { applyFilters } from "@/lib/filter-utils";
import { applySort } from "@/lib/sort-utils";

import { FilterCondition } from "@/types/common.type";

import { createClient } from "@/utils/supabase/component";

import { EmployeeRequest } from "./employee-request.type";

type EmployeeRequestStates = {
  employeeRequests: EmployeeRequest[];
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
  loadingSave: boolean;
};

type EmployeeRequestActions = {
  fetchEmployeeRequests: () => Promise<void>;
  updateEmployeeRequest: (id: string, data: Partial<EmployeeRequest>) => Promise<void>;
  addEmployeeRequest: (request: EmployeeRequest) => Promise<void>;
  deleteEmployeeRequest: (id: string) => Promise<void>;
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
  getFilteredEmployeeRequests: (data: EmployeeRequest[]) => EmployeeRequest[];
  getSortedEmployeeRequests: (data: EmployeeRequest[]) => EmployeeRequest[];

  setLoadingSave: (loading: boolean) => void;
};

export const useEmployeeRequestsStore = create<EmployeeRequestStates & EmployeeRequestActions>(
  (set, get) => ({
    employeeRequests: [],
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

    getFilteredEmployeeRequests: (data: EmployeeRequest[]) => {
      const { searchQuery, filterConditions, filterCaseSensitive } = get();

      // If no data, return empty array
      if (!data || data.length === 0) {
        return [];
      }

      // First apply search if there is a search query
      let filtered = data;
      if (searchQuery) {
        filtered = filtered.filter((employeeRequest) =>
          employeeRequest.title.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      // Then apply other filters if there are any
      if (filterConditions.length > 0) {
        filtered = applyFilters(filtered, filterConditions, filterCaseSensitive);
      }

      return filtered;
    },

    getSortedEmployeeRequests: (data: EmployeeRequest[]) => {
      const { sortRules, sortCaseSensitive, sortNullsFirst } = get();

      return applySort("employeeRequests", data, sortRules, {
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

    fetchEmployeeRequests: async () => {
      const supabase = createClient();
      set({ isLoading: true, error: null });
      try {
        const { data, error } = await supabase.from("employee_requests").select("*");
        if (error) throw error;
        set({ employeeRequests: data as EmployeeRequest[], isLoading: false });
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    updateEmployeeRequest: async (id: string, updates: Partial<EmployeeRequest>) => {
      const supabase = createClient();
      try {
        const { error } = await supabase.from("employee_requests").update(updates).eq("id", id);
        if (error) throw error;
        await get().fetchEmployeeRequests();
      } catch (error) {
        set({ error: (error as Error).message });
      }
    },

    addEmployeeRequest: async (request) => {
      const supabase = createClient();
      try {
        const { error } = await supabase.from("employee_requests").insert([request]);
        if (error) throw error;
        await get().fetchEmployeeRequests();
      } catch (error) {
        set({ error: (error as Error).message });
      }
    },

    deleteEmployeeRequest: async (id: string) => {
      const supabase = createClient();
      try {
        const { error } = await supabase.from("employee_requests").delete().eq("id", id);
        if (error) throw error;
        await get().fetchEmployeeRequests();
      } catch (error) {
        set({ error: (error as Error).message });
      }
    },
    setLoadingSave: (loading: boolean) => set({ loadingSave: loading }),
    loadingSave: false,
  }),
);
