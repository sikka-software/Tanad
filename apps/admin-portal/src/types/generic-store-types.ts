// stores/types.ts
import { FilterCondition } from "@/types/common.type";

export type ViewMode = "table" | "cards";

export type SortRule = {
  field: string;
  direction: string;
};

export type BaseStates<T> = {
  data?: T[]; // Optional since some stores might manage data externally
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
};

export type BaseActions<T> = {
  setData?: (data: T[]) => void; // Optional setter for data
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
  getFilteredData: (data: T[]) => T[];
  getSortedData: (data: T[]) => T[];
};

export type SearchFilterFn<T> = (item: T, searchQuery: string) => boolean;
