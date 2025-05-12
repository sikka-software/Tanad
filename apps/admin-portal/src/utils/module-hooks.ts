import { VisibilityState, Updater } from "@tanstack/react-table";

import { FilterCondition, SortRule } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

export interface ModuleStoreBase {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  selectedRows: any[]; // Replace `any` with your row type if possible
  setSelectedRows: (rows: any[]) => void;
  columnVisibility: VisibilityState;
  setColumnVisibility: (columnVisibility: VisibilityState | Updater<VisibilityState>) => void;
  viewMode: string;
  clearSelection: () => void;
  sortRules: SortRule[]; // Replace with your actual type
  sortCaseSensitive: boolean;
  sortNullsFirst: boolean;
  searchQuery: string;
  filterConditions: FilterCondition[]; // Replace with your actual type
  filterCaseSensitive: boolean;
  getFilteredData: (data: any[]) => any[]; // Adjust as needed
  getSortedData: (data: any[]) => any[]; // Adjust as needed
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
    useFilterConditions: () => useStore().filterConditions,
    useFilterCaseSensitive: () => useStore().filterCaseSensitive,
    useGetFilteredData: () => useStore().getFilteredData,
    useGetSortedData: () => useStore().getSortedData,
  };
}
