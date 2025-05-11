// stores/createGenericStore.ts
import { create } from "zustand";

import { applyFilters } from "@/lib/filter-utils";
import { applySort } from "@/lib/sort-utils";

import { BaseStates, BaseActions, SearchFilterFn } from "@/types/generic-store-types";

export function createGenericStore<T extends { id: string }>(
  storeName: string,
  searchFilterFn?: SearchFilterFn<T>,
  initialState?: Partial<BaseStates<T>>,
) {
  const defaultSearchFilter: SearchFilterFn<T> = (item, searchQuery) => {
    if ("name" in item) {
      return (item as any).name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if ("title" in item) {
      return (item as any).title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return false;
  };

  const actualSearchFilter = searchFilterFn || defaultSearchFilter;

  return create<BaseStates<T> & BaseActions<T>>((set, get) => ({
    data: [],
    dataLength: 0,
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
    isFormDialogOpen: false,
    actionableItem: null,
    ...initialState,

    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setDataLength: (dataLength) => set({ dataLength }),
    getFilteredData: (data: T[]) => {
      const { searchQuery, filterConditions, filterCaseSensitive } = get();

      if (!data || data.length === 0) {
        return [];
      }

      let filtered = data;
      if (searchQuery) {
        filtered = filtered.filter((item) => actualSearchFilter(item, searchQuery));
      }

      if (filterConditions.length > 0) {
        filtered = applyFilters(filtered, filterConditions, filterCaseSensitive);
      }

      return filtered;
    },

    getSortedData: (data: T[]) => {
      const { sortRules, sortCaseSensitive, sortNullsFirst } = get();

      if (!data || data.length === 0) {
        return [];
      }
      return applySort(storeName, data, sortRules, {
        caseSensitive: sortCaseSensitive,
        nullsFirst: sortNullsFirst,
      });
    },

    setSortRules: (sortRules) => {
      set({ sortRules });
    },
    setSortCaseSensitive: (sortCaseSensitive) => set({ sortCaseSensitive }),
    setSortNullsFirst: (sortNullsFirst) => set({ sortNullsFirst }),
    setFilterConditions: (filterConditions) => set({ filterConditions }),
    setFilterCaseSensitive: (filterCaseSensitive) => set({ filterCaseSensitive }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setViewMode: (viewMode) => set({ viewMode }),
    setIsDeleteDialogOpen: (isDeleteDialogOpen) => set({ isDeleteDialogOpen }),
    setIsFormDialogOpen: (isFormDialogOpen) => set({ isFormDialogOpen }),
    setActionableItem: (actionableItem) => set({ actionableItem }),

    setSelectedRows: (ids) => {
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

    setData: (data: T[]) => set({ data }),
  }));
}
