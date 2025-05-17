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

import { FilterCondition } from "@/types/common.type";

import EmployeeCard from "@/employee/employee.card";
import useEmployeeColumns from "@/employee/employee.columns";
import { EmployeeForm } from "@/employee/employee.form";
import {
  useEmployees,
  useBulkDeleteEmployees,
  useDuplicateEmployee,
} from "@/employee/employee.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/employee/employee.options";
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
  const setSortRules = moduleHooks.useSetSortRules();
  // Filtering & Search
  const searchQuery = moduleHooks.useSearchQuery();
  const setSearchQuery = moduleHooks.useSetSearchQuery();
  const filterConditions = moduleHooks.useFilterConditions();
  const setFilterConditions = moduleHooks.useSetFilterConditions();
  // Misc
  const viewMode = moduleHooks.useViewMode();
  const getFilteredDataClient = moduleHooks.useGetFilteredData();
  const getSortedDataClient = moduleHooks.useGetSortedData();

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

  const columnFiltersTanStack = useMemo(() => {
    return filterConditions.map((condition) => ({
      id: condition.field,
      value: {
        filterValue: condition.value,
        operator: condition.operator,
        type: condition.type,
      },
    }));
  }, [filterConditions]);

  const handleColumnFiltersChange = (updaterOrValue: any) => {
    const newTanStackFilters =
      typeof updaterOrValue === "function" ? updaterOrValue(columnFiltersTanStack) : updaterOrValue;

    const newStoreFilters: FilterCondition[] = newTanStackFilters.map((tf: any) => ({
      field: tf.id,
      value: tf.value.filterValue,
      operator: tf.value.operator,
      type: tf.value.type,
      conjunction: "and",
    }));
    setFilterConditions(newStoreFilters);
  };

  useEffect(() => {
    setIsApplyingClientFilter(true);
    const timer = setTimeout(() => {
      setIsApplyingClientFilter(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [filterConditions, searchQuery]);

  const filteredDataForCards = useMemo(() => {
    return getFilteredDataClient(storeData);
  }, [storeData, getFilteredDataClient, searchQuery, filterConditions]);

  const sortedDataForCards = useMemo(() => {
    return getSortedDataClient(filteredDataForCards);
  }, [filteredDataForCards, getSortedDataClient, sortRules]);

  const tanstackSorting = useMemo(
    () => sortRules.map((rule) => ({ id: rule.field, desc: rule.direction === "desc" })),
    [sortRules],
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
      setSearchQuery(updater(searchQuery));
    } else {
      setSearchQuery(updater);
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
            store={useEmployeeStore}
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
              globalFilter={searchQuery}
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
