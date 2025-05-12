// stores/types.ts
import { VisibilityState } from "@tanstack/react-table";
import { Updater } from "@tanstack/react-table";

import { FilterCondition } from "@/types/common.type";

export type ViewMode = "table" | "cards";

export type SortRule = {
  field: string;
  direction: "asc" | "desc";
};

export type BaseStates<T> = {
  columnVisibility: VisibilityState;
  data?: T[];
  dataLength?: number;
  isLoading: boolean;
  error: string | null;
  selectedRows: string[];
  filterConditions: FilterCondition[];
  filterCaseSensitive: boolean;
  searchQuery: string;
  viewMode: ViewMode;
  isDeleteDialogOpen: boolean;
  sortRules: SortRule[];
  sortCaseSensitive: boolean;
  sortNullsFirst: boolean;
  isFormDialogOpen: boolean;
  actionableItem: T | null;
};

export type BaseActions<T> = {
  setColumnVisibility: (columnVisibility: VisibilityState | Updater<VisibilityState>) => void;
  setData?: (data: T[]) => void;
  setDataLength?: (dataLength: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedRows: (ids: string[]) => void;
  clearSelection: () => void;
  setFilterConditions: (filterConditions: FilterCondition[]) => void;
  setFilterCaseSensitive: (filterCaseSensitive: boolean) => void;
  setSearchQuery: (searchQuery: string) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setIsDeleteDialogOpen: (isDeleteDialogOpen: boolean) => void;
  setSortRules: (sortRules: SortRule[]) => void;
  setSortCaseSensitive: (sortCaseSensitive: boolean) => void;
  setSortNullsFirst: (sortNullsFirst: boolean) => void;
  setIsFormDialogOpen: (isFormDialogOpen: boolean) => void;
  setActionableItem: (actionableItem: T | null) => void;
  getFilteredData: (data: T[]) => T[];
  getSortedData: (data: T[]) => T[];
};

export type SearchFilterFn<T> = (item: T, searchQuery: string) => boolean;
