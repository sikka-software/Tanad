import { VisibilityState, Updater } from "@tanstack/react-table";

import { FilterCondition, SortRule } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

export interface ModuleStoreBase {
  viewMode: string;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;

  columnVisibility: VisibilityState;
  setColumnVisibility: (columnVisibility: VisibilityState | Updater<VisibilityState>) => void;

  selectedRows: any[];
  setSelectedRows: (rows: any[]) => void;
  clearSelection: () => void;

  sortRules: SortRule[];
  setSortRules: (sortRules: SortRule[]) => void;
  getSortedData: (data: any[]) => any[];

  sortCaseSensitive: boolean;
  sortNullsFirst: boolean;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  filterConditions: FilterCondition[];
  filterCaseSensitive: boolean;
  setFilterConditions: (conditions: FilterCondition[]) => void;
  getFilteredData: (data: any[]) => any[];

  pendingDeleteIds: string[];
  setPendingDeleteIds: (ids: string[]) => void;
}

export function createModuleStoreHooks<T extends ModuleStoreBase>(
  useStore: () => T,
  moduleName: string,
) {
  return {
    useCanRead: () => useUserStore((state) => state.hasPermission(`${moduleName}.read`)),
    useCanCreate: () => useUserStore((state) => state.hasPermission(`${moduleName}.create`)),
    useIsLoading: () => useStore().isLoading,
    useSetIsLoading: () => useStore().setIsLoading,
    useIsDeleteDialogOpen: () => useStore().isDeleteDialogOpen,
    useSetIsDeleteDialogOpen: () => useStore().setIsDeleteDialogOpen,
    useSelectedRows: () => useStore().selectedRows,
    useSetSelectedRows: () => useStore().setSelectedRows,
    useColumnVisibility: () => useStore().columnVisibility,
    useSetColumnVisibility: () => useStore().setColumnVisibility,
    useViewMode: () => useStore().viewMode,
    useClearSelection: () => useStore().clearSelection,
    useSortRules: () => useStore().sortRules,
    useSortCaseSensitive: () => useStore().sortCaseSensitive,
    useSortNullsFirst: () => useStore().sortNullsFirst,
    useSearchQuery: () => useStore().searchQuery,
    useSetSearchQuery: () => useStore().setSearchQuery,
    useFilterConditions: () => useStore().filterConditions,
    useSetFilterConditions: () => useStore().setFilterConditions,
    useFilterCaseSensitive: () => useStore().filterCaseSensitive,
    useGetFilteredData: () => useStore().getFilteredData,
    useGetSortedData: () => useStore().getSortedData,
    useSetSortRules: () => useStore().setSortRules,
    usePendingDeleteIds: () => useStore().pendingDeleteIds,
    useSetPendingDeleteIds: () => useStore().setPendingDeleteIds,
  };
}
