import { createModuleStoreHooks } from "@/utils/module-hooks";
import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState, useEffect } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import { FormSheet } from "@/components/ui/form-sheet";

import EmployeeCard from "@/employee/employee.card";
import {
  useEmployees,
  useBulkDeleteEmployees,
  useDuplicateEmployee,
} from "@/employee/employee.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/employee/employee.options";
import useEmployeesStore from "@/employee/employee.store";
import useEmployeeStore from "@/employee/employee.store";
import EmployeesTable from "@/employee/employee.table";

import useEmployeeColumns from "@/modules/employee/employee.columns";
import { EmployeeForm } from "@/modules/employee/employee.form";
import { EmployeeUpdateData } from "@/modules/employee/employee.types";
import { useJobs } from "@/modules/job/job.hooks";

export default function EmployeesPage() {
  const t = useTranslations();
  const router = useRouter();
  const { data: jobs } = useJobs();

  const columns = useEmployeeColumns();

  const moduleHooks = createModuleStoreHooks(useEmployeeStore, "employees");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<EmployeeUpdateData | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();

  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();

  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();

  const selectedRows = moduleHooks.useSelectedRows();
  const setSelectedRows = moduleHooks.useSetSelectedRows();

  const columnVisibility = moduleHooks.useColumnVisibility();
  const setColumnVisibility = moduleHooks.useSetColumnVisibility();

  const viewMode = moduleHooks.useViewMode();
  const clearSelection = moduleHooks.useClearSelection();
  const sortRules = moduleHooks.useSortRules();
  const sortCaseSensitive = moduleHooks.useSortCaseSensitive();
  const sortNullsFirst = moduleHooks.useSortNullsFirst();
  const searchQuery = moduleHooks.useSearchQuery();
  const filterConditions = moduleHooks.useFilterConditions();
  const filterCaseSensitive = moduleHooks.useFilterCaseSensitive();
  const getFilteredData = moduleHooks.useGetFilteredData();
  const getSortedData = moduleHooks.useGetSortedData();

  const { data: employees, isLoading, error } = useEmployees();
  const { mutateAsync: deleteEmployees, isPending: isDeleting } = useBulkDeleteEmployees();
  const { mutate: duplicateEmployee } = useDuplicateEmployee();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: employees,
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
    if (employees && setData) {
      setData(employees);
    }
  }, [employees, setData]);

  const filteredData = useMemo(() => {
    return getFilteredData(storeData);
  }, [storeData, getFilteredData, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedData = useMemo(() => {
    return getSortedData(filteredData);
  }, [filteredData, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canRead) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta
        title={t("Pages.Employees.title")}
        description={t("Pages.Employees.description")}
      />
      <DataPageLayout count={employees?.length} itemsText={t("Pages.Employees.title")}>
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
            hideOptions={employees?.length === 0}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={(updater) => {
              setColumnVisibility((prev) =>
                typeof updater === "function" ? updater(prev) : updater,
              );
            }}
          />
        )}
        <div>
          {viewMode === "table" ? (
            <EmployeesTable
              data={sortedData}
              isLoading={isLoading}
              error={error}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedData}
                isLoading={isLoading}
                error={error}
                emptyMessage={t("Pages.Employees.no_employees_found")}
                renderItem={(employee) => (
                  <EmployeeCard
                    position={jobs?.find((j) => j.id === employee.job_id)?.title}
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
        />
      </DataPageLayout>
    </div>
  );
}

EmployeesPage.messages = [
  "Employees",
  "Jobs",
  "Departments",
  "Pages",
  "Notes",
  "General",
  "Forms",
  "General",
];

export const getStaticProps: GetStaticProps  = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        EmployeesPage.messages,
      ),
    },
  };
};
