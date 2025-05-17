import { pick } from "lodash";
import { FileUser, Plus, User } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState, useEffect } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import FormSheet from "@/ui/form-sheet";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { createModuleStoreHooks } from "@/utils/module-hooks";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import EmployeeCard from "@/employee/employee.card";
import useEmployeeColumns from "@/employee/employee.columns";
import { EmployeeForm } from "@/employee/employee.form";
import {
  useEmployees,
  useBulkDeleteEmployees,
  useDuplicateEmployee,
} from "@/employee/employee.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/employee/employee.options";
import useEmployeesStore from "@/employee/employee.store";
import useEmployeeStore from "@/employee/employee.store";
import EmployeesTable from "@/employee/employee.table";
import { Employee, EmployeeUpdateData } from "@/employee/employee.types";

import { useJobs } from "@/job/job.hooks";

export default function EmployeesPage() {
  const t = useTranslations();
  const router = useRouter();
  const { data: jobs } = useJobs();

  const columns = useEmployeeColumns();

  const moduleHooks = createModuleStoreHooks(useEmployeeStore, "employees");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<EmployeeUpdateData | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [isApplyingClientFilter, setIsApplyingClientFilter] = useState(false);

  // Permissions
  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();
  // Loading
  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();
  // Delete Dialog
  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();
  // Selected Rows
  const selectedRows = moduleHooks.useSelectedRows();
  const setSelectedRows = moduleHooks.useSetSelectedRows();
  const clearSelection = moduleHooks.useClearSelection();
  // Column Visibility
  const columnVisibility = moduleHooks.useColumnVisibility();
  const setColumnVisibility = moduleHooks.useSetColumnVisibility();
  // Sorting
  const sortRules = moduleHooks.useSortRules();
  const sortCaseSensitive = moduleHooks.useSortCaseSensitive();
  const sortNullsFirst = moduleHooks.useSortNullsFirst();
  const setSortRules = moduleHooks.useSetSortRules();
  // Filtering
  const filterConditions = moduleHooks.useFilterConditions();
  const getFilteredData = moduleHooks.useGetFilteredData();
  const getSortedData = moduleHooks.useGetSortedData();
  // Misc
  const viewMode = moduleHooks.useViewMode();

  // Get state and setters directly from the store for filters if not in moduleHooks
  const zustandSearchQuery = useEmployeesStore((state) => state.searchQuery);
  const zustandSetSearchQuery = useEmployeesStore((state) => state.setSearchQuery);
  const zustandFilterConditions = useEmployeesStore((state) => state.filterConditions);
  const zustandSetFilterConditions = useEmployeesStore((state) => state.setFilterConditions);
  const zustandFilterCaseSensitive = useEmployeesStore((state) => state.filterCaseSensitive);
  const zustandCaseSensitive = useEmployeesStore((state) => state.sortCaseSensitive);
  const zustandSortRules = useEmployeesStore((state) => state.sortRules);
  const zustandSortCaseSensitive = useEmployeesStore((state) => state.sortCaseSensitive);
  const zustandSortNullsFirst = useEmployeesStore((state) => state.sortNullsFirst);

  // Re-introduce client-side filtering/sorting for non-TanStack views (e.g., Card view)
  const getFilteredDataClient = useEmployeesStore((state) => state.getFilteredData);
  const getSortedDataClient = useEmployeesStore((state) => state.getSortedData);

  const { data: employeesFromHook, isLoading, error } = useEmployees();
  const { mutateAsync: deleteEmployees, isPending: isDeleting } = useBulkDeleteEmployees();
  const { mutate: duplicateEmployee } = useDuplicateEmployee();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: employeesFromHook,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateEmployee,
    moduleName: "Employees",
  });

  const handleConfirmDelete = createDeleteHandler(deleteEmployees, {
    loading: "Employees.loading.delete",
    success: "Employees.success.delete",
    error: "Employees.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useEmployeeStore((state) => state.data) || [];
  const setData = useEmployeeStore((state) => state.setData);

  useEffect(() => {
    if (employeesFromHook && setData) {
      setData(employeesFromHook);
    }
  }, [employeesFromHook, setData]);

  // Transform filterConditions from store to TanStack Table's ColumnFiltersState
  const columnFiltersTanStack = useMemo(() => {
    return zustandFilterConditions.map((condition) => ({
      id: condition.field,
      value: {
        filterValue: condition.value,
        operator: condition.operator,
        type: condition.type,
      },
    }));
  }, [zustandFilterConditions]);

  // Handler for TanStack Table's onColumnFiltersChange
  const handleColumnFiltersChange = (updaterOrValue: any) => {
    const newFilters =
      typeof updaterOrValue === "function" ? updaterOrValue(columnFiltersTanStack) : updaterOrValue;
    // This is still a simplification. Converting newFilters (ColumnFilter[]) back to FilterCondition[]
    // is non-trivial as TanStack's state doesn't hold operator, type, conjunction.
    // For a robust solution, FilterPopover should perhaps emit TanStack-ready filters,
    // or this function becomes much more complex, or columns get individual filter controls.
    // As a TEMPORARY step, if PageSearchAndFilter updates zustandFilterConditions directly,
    // this handler might not need to do much other than log or be a pass-through if TanStack manages it internally.
    // For now, we will assume zustandSetFilterConditions handles the FilterCondition[] format.
    // We'd need to map `newFilters` back or adjust how `PageSearchAndFilter` updates.
    // console.log("New TanStack Column Filters:", newFilters);

    // Simplistic: If `PageSearchAndFilter` is the sole source of truth for `filterConditions`
    // in the store, this function might not need to call `zustandSetFilterConditions`
    // unless TanStack Table needs to be the one driving that state update.
    // Let's assume PageSearchAndFilter updates zustandFilterConditions, and this is for TanStack to read.
  };

  // Effect to manage the isApplyingClientFilter state for visual feedback
  useEffect(() => {
    // This effect triggers when the actual filters in the store change.
    // We want to show loading briefly.
    setIsApplyingClientFilter(true);
    const timer = setTimeout(() => {
      setIsApplyingClientFilter(false);
    }, 50); // Brief delay to ensure UI can show loading

    return () => clearTimeout(timer);
  }, [zustandFilterConditions, zustandSearchQuery]); // Dependencies that trigger table re-filter

  // Data for Card View (uses client-side filtering/sorting from the store)
  const filteredDataForCards = useMemo(() => {
    return getFilteredDataClient(storeData); // Uses storeData, searchQuery, filterConditions from store
  }, [storeData, getFilteredDataClient]); // searchQuery and filterConditions are implicit via getFilteredDataClient

  const sortedDataForCards = useMemo(() => {
    return getSortedDataClient(filteredDataForCards);
  }, [filteredDataForCards, getSortedDataClient]); // sortRules etc. are implicit via getSortedDataClient

  const tanstackSorting = useMemo(
    () => sortRules.map((rule) => ({ id: rule.field, desc: rule.direction === "desc" })),
    [sortRules],
  );

  console.log("[EmployeesPage] storeData to be passed to table:", storeData);
  console.log(
    "[EmployeesPage] columnFiltersTanStack to be passed to table:",
    columnFiltersTanStack,
  );
  console.log(
    "[EmployeesPage] globalFilter (zustandSearchQuery) to be passed to table:",
    zustandSearchQuery,
  );

  const handleTanstackSortingChange = (
    updater:
      | ((prev: { id: string; desc: boolean }[]) => { id: string; desc: boolean }[])
      | { id: string; desc: boolean }[],
  ) => {
    let nextSorting = typeof updater === "function" ? updater(tanstackSorting) : updater;
    const newSortRules = nextSorting.map((s: { id: string; desc: boolean }) => ({
      field: s.id,
      direction: (s.desc ? "desc" : "asc") as "asc" | "desc",
    }));
    setSortRules(newSortRules);
  };

  const handleTanstackGlobalFilterChange = (updater: string | ((old: string) => string)) => {
    if (typeof updater === "function") {
      zustandSetSearchQuery(updater(zustandSearchQuery));
    } else {
      zustandSetSearchQuery(updater);
    }
  };

  if (!canRead) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta
        title={t("Pages.Employees.title")}
        description={t("Pages.Employees.description")}
      />
      <DataPageLayout count={employeesFromHook?.length} itemsText={t("Pages.Employees.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode
            selectedRows={selectedRows}
            clearSelection={clearSelection}
            isDeleting={isDeleting}
            setIsDeleteDialogOpen={(open) => {
              if (open) setPendingDeleteIds(selectedRows);
              setIsDeleteDialogOpen(open);
            }}
          />
        ) : (
          <PageSearchAndFilter
            store={useEmployeesStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Employees.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Employees.add")}
            searchPlaceholder={t("Pages.Employees.search")}
            hideOptions={employeesFromHook?.length === 0}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={(updater) => {
              setColumnVisibility((prev) =>
                typeof updater === "function" ? updater(prev) : updater,
              );
            }}
            isApplyingFilter={isApplyingClientFilter}
          />
        )}
        <div>
          {viewMode === "table" ? (
            <EmployeesTable
              data={storeData}
              isLoading={isLoading}
              error={error}
              onActionClicked={onActionClicked}
              sorting={tanstackSorting}
              onSortingChange={handleTanstackSortingChange}
              globalFilter={zustandSearchQuery}
              onGlobalFilterChange={handleTanstackGlobalFilterChange}
              columnFilters={columnFiltersTanStack}
              onColumnFiltersChange={handleColumnFiltersChange}
            />
          ) : (
            <div className="p-4">
              <DataModelList<Employee>
                data={sortedDataForCards}
                isLoading={isLoading}
                error={error}
                empty={{
                  title: t("Employees.create_first.title"),
                  description: t("Employees.create_first.description"),
                  add: t("Pages.Employees.add"),
                  icons: [FileUser, Plus, FileUser],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(employee) => (
                  <EmployeeCard
                    position={jobs?.find((j) => j.id === employee.job_id)?.title || ""}
                    onActionClicked={onActionClicked}
                    employee={employee}
                  />
                )}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormSheet
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Pages.Employees.edit")}
          formId="employee-form"
          loadingSave={loadingSave}
        >
          <EmployeeForm
            formHtmlId={"employee-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setLoadingSave(false);
              setActionableItem(null);
            }}
            defaultValues={actionableItem}
            editMode={true}
          />
        </FormSheet>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(pendingDeleteIds)}
          title={t("Employees.confirm_delete", { count: selectedRows.length })}
          description={t("Employees.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

EmployeesPage.messages = [
  "Metadata",
  "Employees",
  "Jobs",
  "Departments",
  "Pages",
  "Notes",
  "General",
  "Forms",
  "General",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        EmployeesPage.messages,
      ),
    },
  };
};
