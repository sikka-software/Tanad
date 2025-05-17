import {
  VisibilityState,
  Updater as TableUpdater,
  ColumnFilter,
  ColumnFiltersState,
  OnChangeFn,
  SortingState,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { toast } from "sonner";

import {
  createModuleStoreHooks,
  ModuleStoreBase as GenericModuleStoreBase,
} from "@/utils/module-hooks";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import { FilterCondition, SortRule, SortableColumn, FilterableField } from "@/types/common.type";

// Stable no-op duplicate hook
const useNoOpDuplicate = () => {
  const mutate = useCallback((id: string) => {
    console.warn(
      `Attempted to duplicate item ${id}, but no operational duplicate hook was configured.`,
    );
  }, []);
  return { mutate, isPending: false };
};

// Define a more specific base for the module store used by the hook
// This ensures the hook knows what to expect from the store it interacts with.
interface HookModuleStore<TData extends { id: string }, TUpdateData>
  extends Omit<
    GenericModuleStoreBase,
    | "selectedRows"
    | "actionableItem"
    | "getFilteredData"
    | "getSortedData"
    | "data"
    | "setData"
    | "setSelectedRows"
    | "setSortRules"
    | "setFilterConditions"
    | "setSearchQuery"
    | "setColumnVisibility"
  > {
  selectedRows: string[];
  setSelectedRows: (rows: string[]) => void;
  actionableItem: TUpdateData | null;
  setActionableItem: (item: TUpdateData | null) => void;
  data: TData[];
  setData: (data: TData[]) => void;
  getFilteredData: (data: TData[]) => TData[];
  getSortedData: (data: TData[]) => TData[];
  sortRules: SortRule[];
  setSortRules: (rules: SortRule[]) => void;
  filterConditions: FilterCondition[];
  setFilterConditions: (conditions: FilterCondition[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  columnVisibility: VisibilityState;
  setColumnVisibility: (updater: VisibilityState | TableUpdater<VisibilityState>) => void;
}

export interface ModulePageConfig<
  TData extends { id: string },
  TUpdateData extends { id?: string }, // For actionableItem, id is optional for new items
> {
  moduleName: string;
  useStore: () => HookModuleStore<TData, TUpdateData>;
  useDataHook: () => {
    data?: TData[];
    isLoading: boolean;
    error?: Error | null;
    mutate?: () => Promise<any>;
  };
  useBulkDeleteHook: () => { mutateAsync: (ids: string[]) => Promise<any>; isPending: boolean };
  useDuplicateHook?: () => { mutate: (id: string) => void; isPending?: boolean };
  columnsHook: (callbacks?: any) => any[]; // Callbacks for actions within columns, e.g., onEdit
  sortableColumns: SortableColumn[];
  filterableFields: FilterableField[];
  pageTexts: {
    title: string;
    add: string;
    edit: string;
    search: string;
    loadingDelete: string;
    successDelete: string;
    errorDelete: string;
    confirmDeleteTitle: string;
    deleteDescription: string;
    itemUnit: string; // e.g. "Employee", "Job"
  };
  initialSortRules?: SortRule[];
  formId?: string;
}

export function useModulePageLogic<
  TData extends { id: string },
  TUpdateData extends { id?: string },
>(config: ModulePageConfig<TData, TUpdateData>) {
  const {
    moduleName,
    useStore,
    useDataHook,
    useBulkDeleteHook,
    columnsHook, // Keep in mind how columns get action handlers
    pageTexts,
    initialSortRules = [],
    formId = `${moduleName}-form`,
  } = config;

  const t = useTranslations();
  const router = useRouter();

  // Initialize module store hooks
  const storeAccess = createModuleStoreHooks(useStore, moduleName);

  const canRead = storeAccess.useCanRead();
  const canCreate = storeAccess.useCanCreate();
  const storeLoadingSave = storeAccess.useIsLoading();
  const setStoreLoadingSave = storeAccess.useSetIsLoading();
  const isStoreDeleteDialogOpen = storeAccess.useIsDeleteDialogOpen();
  const setStoreIsDeleteDialogOpen = storeAccess.useSetIsDeleteDialogOpen();
  const selectedRows = storeAccess.useSelectedRows() as string[];
  const setSelectedRows = storeAccess.useSetSelectedRows();
  const clearSelection = storeAccess.useClearSelection();
  const columnVisibility = storeAccess.useColumnVisibility();
  const setColumnVisibility = storeAccess.useSetColumnVisibility();
  const viewMode = storeAccess.useViewMode();
  const sortRules = storeAccess.useSortRules();
  const setSortRules = storeAccess.useSetSortRules();
  const searchQuery = storeAccess.useSearchQuery();
  const setSearchQuery = storeAccess.useSetSearchQuery();
  const filterConditions = storeAccess.useFilterConditions();
  const setFilterConditions = storeAccess.useSetFilterConditions();

  // Direct store access for debugging setColumnVisibility
  const store = useStore();
  const setColumnVisibilityDirectly = store.setColumnVisibility; // Directly access the method
  // const columnVisibility = store.columnVisibility; // Also get columnVisibility state directly for consistency if needed for debugging

  const storeSetData = store.setData;
  const storeData = store.data || [];
  const getFilteredDataClient = store.getFilteredData;
  const getSortedDataClient = store.getSortedData;

  const storeActionableItem = useStore().actionableItem;
  const setStoreActionableItem = useStore().setActionableItem;

  // Local page state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<TUpdateData | null>(null); // Local for form editing
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  // Data fetching
  const {
    data: fetchedDataItems,
    isLoading: isLoadingData,
    error: fetchDataError,
    mutate: mutateDataHook,
  } = useDataHook();

  // Mutations
  const { mutateAsync: bulkDeleteMutation, isPending: isDeleting } = useBulkDeleteHook();

  // Resolve the duplicate hook: use the one from config or the no-op fallback
  const resolvedUseDuplicateHook = config.useDuplicateHook || useNoOpDuplicate;
  const { mutate: actualDuplicateMutateFn, isPending: isDuplicating } = resolvedUseDuplicateHook(); // Unconditional call

  const duplicateMutationForActions = useCallback(
    (id: string) => {
      actualDuplicateMutateFn(id); // actualDuplicateMutateFn will always be a function from resolvedUseDuplicateHook
    },
    [actualDuplicateMutateFn],
  );

  // Effect to set initial sort rules to the store if provided and store is empty
  useEffect(() => {
    if (initialSortRules.length > 0 && sortRules.length === 0) {
      setSortRules(initialSortRules);
    }
  }, [initialSortRules, sortRules, setSortRules]);

  // Sync fetched data to store
  useEffect(() => {
    if (fetchedDataItems) {
      storeSetData(fetchedDataItems);
    }
  }, [fetchedDataItems, storeSetData]);

  // Data for display (client-side filtering/sorting on storeData)
  const clientFilteredData = useMemo(() => {
    return getFilteredDataClient(storeData);
  }, [storeData, getFilteredDataClient, searchQuery, filterConditions]);

  const displayData = useMemo(() => {
    return getSortedDataClient(clientFilteredData);
  }, [clientFilteredData, getSortedDataClient, sortRules]);

  // TanStack Table state setup (sorting, global filter, column filters)
  const tanstackSorting = useMemo(
    (): SortingState =>
      sortRules.map((rule) => ({ id: rule.field, desc: rule.direction === "desc" })),
    [sortRules],
  );

  const handleTanstackSortingChange: OnChangeFn<SortingState> = useCallback(
    (updaterOrValue) => {
      const newSortingState =
        typeof updaterOrValue === "function" ? updaterOrValue(tanstackSorting) : updaterOrValue;
      setSortRules(
        newSortingState.map((s) => ({
          field: s.id,
          direction: (s.desc ? "desc" : "asc") as "asc" | "desc",
        })),
      );
    },
    [tanstackSorting, setSortRules],
  );

  const handleTanstackGlobalFilterChange = useCallback(
    (updater: string | ((old: string) => string)) => {
      setSearchQuery(typeof updater === "function" ? updater(searchQuery) : updater);
    },
    [searchQuery, setSearchQuery],
  );

  const columnFiltersConfigForTable = useMemo(
    (): ColumnFilter[] =>
      filterConditions.map((condition) => ({
        id: condition.field,
        value: { filterValue: condition.value, operator: condition.operator, type: condition.type },
      })),
    [filterConditions],
  );

  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updaterOrValue) => {
      const newTanStackFilters =
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnFiltersConfigForTable)
          : updaterOrValue;
      const newStoreFilters: FilterCondition[] = newTanStackFilters.map((tf: ColumnFilter) => ({
        id: Date.now() + Math.random(),
        field: tf.id,
        value: String((tf.value as any)?.filterValue ?? tf.value ?? ""),
        operator: (tf.value as any)?.operator || "contains",
        type: (tf.value as any)?.type || "text",
        conjunction: "and",
      }));
      setFilterConditions(newStoreFilters);
    },
    [columnFiltersConfigForTable, setFilterConditions],
  );

  // Callbacks for column actions (e.g., edit)
  const handleEditAction = useCallback(
    (itemToEdit: TData) => {
      // Assuming TUpdateData can be derived or is compatible with TData for editing
      setActionableItem(itemToEdit as unknown as TUpdateData);
      setIsFormDialogOpen(true);
    },
    [setActionableItem, setIsFormDialogOpen],
  );

  const columns = useMemo(
    () => columnsHook({ onEdit: handleEditAction }),
    [columnsHook, handleEditAction],
  );

  // DataTableActions setup
  const { handleAction: onActionClicked } = useDataTableActions<TData>({
    data: fetchedDataItems || [],
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen: setStoreIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: (item: TData | null) => {
      setActionableItem(item as unknown as TUpdateData | null);
    },
    duplicateMutation: duplicateMutationForActions,
    moduleName,
  });

  // Delete handler setup
  const { createDeleteHandler } = useDeleteHandler();
  const handleConfirmDelete = createDeleteHandler(bulkDeleteMutation, {
    loading: pageTexts.loadingDelete,
    success: pageTexts.successDelete,
    error: pageTexts.errorDelete,
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setStoreIsDeleteDialogOpen(false);
      mutateDataHook?.();
      toast.success(`${t(pageTexts.itemUnit, { count: pendingDeleteIds.length })} deleted.`);
    },
    onError: (error) => {
      toast.error(
        `Error deleting ${t(pageTexts.itemUnit, { count: pendingDeleteIds.length })}: ${error.message}`,
      );
    },
  });

  // DEBUGGING: Check if setColumnVisibility is defined
  // console.log('[useModulePageLogic] storeAccess:', storeAccess); // Kept for reference, but store instance is more direct now
  console.log("[useModulePageLogic] store instance:", store);
  console.log(
    "[useModulePageLogic] setColumnVisibility function from store instance:",
    setColumnVisibilityDirectly,
  );

  const handleColumnVisibilityChange = useCallback(
    (updater: VisibilityState | TableUpdater<VisibilityState>) => {
      if (typeof setColumnVisibilityDirectly === "function") {
        setColumnVisibilityDirectly(updater);
      } else {
        console.error(
          "[useModulePageLogic] setColumnVisibility is not a function inside useCallback!",
          setColumnVisibilityDirectly,
        );
      }
    },
    [setColumnVisibilityDirectly],
  );

  const handleSetIsDeleteDialogOpenForSelection = useCallback(
    (open: boolean) => {
      if (open) setPendingDeleteIds(selectedRows);
      setStoreIsDeleteDialogOpen(open);
    },
    [selectedRows, setStoreIsDeleteDialogOpen, setPendingDeleteIds],
  );

  const handleAddClick = useCallback(() => {
    setActionableItem(null); // Clear for "add" mode
    setIsFormDialogOpen(true);
  }, [setActionableItem, setIsFormDialogOpen]);

  const handleFormSuccess = useCallback(() => {
    setIsFormDialogOpen(false);
    setStoreLoadingSave(false);
    setActionableItem(null);
    mutateDataHook?.();
    toast.success(`${t(pageTexts.itemUnit, { count: 1 })} saved successfully.`);
  }, [
    setIsFormDialogOpen,
    setStoreLoadingSave,
    setActionableItem,
    mutateDataHook,
    pageTexts.itemUnit,
    t,
  ]);

  return {
    t,
    router,
    columns,
    config, // Pass back config for page-specific uses like PageSearchAndFilter

    // State & Setters
    isFormDialogOpen,
    setIsFormDialogOpen,
    actionableItem,
    setActionableItem,
    pendingDeleteIds,
    canRead,
    canCreate,
    isLoadingSave: storeLoadingSave,
    setIsLoadingSave: setStoreLoadingSave,
    isDeleteDialogOpen: isStoreDeleteDialogOpen,
    setIsDeleteDialogOpen: setStoreIsDeleteDialogOpen,
    selectedRows,
    setSelectedRows,
    clearSelection,
    columnVisibility,
    setColumnVisibility,
    viewMode,
    sortRules,
    setSortRules,
    searchQuery,
    setSearchQuery,
    filterConditions,
    setFilterConditions,

    // Data related
    fetchedData: fetchedDataItems,
    isLoadingData,
    fetchDataError,
    displayData, // Filtered and sorted data for UI
    storeData, // Raw data from store (after fetch sync)

    // Handlers & Mutation states
    isDeleting,
    onActionClicked,
    handleConfirmDelete,
    handleTanstackSortingChange,
    handleTanstackGlobalFilterChange,
    handleColumnFiltersChange,
    handleColumnVisibilityChange,
    handleSetIsDeleteDialogOpenForSelection,
    handleAddClick,
    handleFormSuccess,

    // For Table component
    tanstackSorting,
    columnFiltersConfigForTable,
    formId,

    // Store access for components like PageSearchAndFilter
    useStore,
  };
}
