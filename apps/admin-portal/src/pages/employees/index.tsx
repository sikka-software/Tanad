import { ColumnFilter, ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { pick } from "lodash";
import { FileUser, Plus, UsersRound } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState, useEffect, useCallback } from "react";

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

import JobForm from "@/modules/job/job.form";
import useJobStore from "@/modules/job/job.store";

export default function EmployeesPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useEmployeeColumns();

  const { data: jobs } = useJobs();

  const moduleHooks = createModuleStoreHooks(useEmployeeStore, "employees");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<EmployeeUpdateData | null>(null);
  const [hasRequests, setHasRequests] = useState(false);

  const isJobDialogOpen = useJobStore((state) => state.isFormDialogOpen);
  const setIsJobDialogOpen = useJobStore((state) => state.setIsFormDialogOpen);
  const loadingSaveJob = useJobStore((state) => state.isLoading);

  // Permissions
  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();
  // Loading
  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();
  // Deleting
  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();
  const pendingDeleteIds = moduleHooks.usePendingDeleteIds();
  const setPendingDeleteIds = moduleHooks.useSetPendingDeleteIds();

  // Selected Rows
  const selectedRows = moduleHooks.useSelectedRows();
  const setSelectedRows = moduleHooks.useSetSelectedRows();
  const clearSelection = moduleHooks.useClearSelection();

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
    setActionableItem: (item: Employee | null) =>
      setActionableItem(item as unknown as EmployeeUpdateData | null),
    duplicateMutation: duplicateEmployee,
    moduleName: "Employees",
  });

  const handleConfirmDelete = createDeleteHandler(
    (options?: { cascade?: boolean }) =>
      deleteEmployees({ ids: pendingDeleteIds, cascade: options?.cascade }),
    {
      loading: "Employees.loading.delete",
      success: "Employees.success.delete",
      error: "Employees.error.delete",
      onSuccess: () => {
        clearSelection();
        setPendingDeleteIds([]);
        setIsDeleteDialogOpen(false);
      },
    },
  );

  const storeData = useEmployeeStore((state) => state.data) || [];
  const setData = useEmployeeStore((state) => state.setData);

  useEffect(() => {
    if (employees && setData) {
      setData(employees);
    }
  }, [employees, setData]);

  const filteredDataForCards = useMemo(() => {
    return getFilteredDataClient(storeData);
  }, [storeData, getFilteredDataClient, searchQuery, filterConditions]);

  const sortedDataForCards = useMemo(() => {
    return getSortedDataClient(filteredDataForCards);
  }, [filteredDataForCards, getSortedDataClient, sortRules]);

  const handleFormSuccess = useCallback(() => {
    setIsFormDialogOpen(false);
    setLoadingSave(false);
    setActionableItem(null);
  }, [setIsFormDialogOpen, setLoadingSave, setActionableItem]);

  useEffect(() => {
    if (pendingDeleteIds.length > 0) {
      // Check if any of the selected employees have requests
      fetch("/api/resource/employees/check_requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: pendingDeleteIds }),
      })
        .then((response) => response.json())
        .then((data) => {
          setHasRequests(data.has_requests);
        })
        .catch((error) => {
          console.error("Error checking employee requests:", error);
        });
    } else {
      setHasRequests(false);
    }
  }, [pendingDeleteIds]);

  if (!canRead) {
    return <NoPermission />;
  }

  useEffect(() => {
    setPendingDeleteIds(selectedRows);
  }, [selectedRows, setPendingDeleteIds]);

  return (
    <div>
      <CustomPageMeta title={t("Pages.Employees.title")} />
      <DataPageLayout count={employees?.length} itemsText={t("Pages.Employees.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode store={useEmployeeStore} isDeleting={isDeleting} />
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
            hideOptions={employees?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <EmployeesTable
              data={sortedDataForCards}
              isLoading={isLoading}
              error={error}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedDataForCards}
                isLoading={isLoading}
                error={error}
                empty={{
                  title: t("Employees.create_first.title"),
                  description: t("Employees.create_first.description"),
                  add: t("Pages.Employees.add"),
                  icons: [UsersRound, Plus, UsersRound],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(employee) => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    position={jobs?.find((j) => j.id === employee.job_id)?.title || ""}
                    onActionClicked={onActionClicked}
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
            onSuccess={handleFormSuccess}
            defaultValues={actionableItem}
            editMode={true}
          />
        </FormSheet>

        <FormSheet
          open={isJobDialogOpen}
          onOpenChange={setIsJobDialogOpen}
          title={t("Pages.Jobs.add")}
          formId="job-form"
          loadingSave={loadingSaveJob}
        >
          <JobForm formHtmlId={"job-form"} onSuccess={() => setIsJobDialogOpen(false)} />
        </FormSheet>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={handleConfirmDelete}
          title={t("Employees.confirm_delete", { count: selectedRows.length })}
          description={t("Employees.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
          showCascadeOption={hasRequests}
          cascadeDescription={
            selectedRows.length > 1
              ? t("Employees.cascade_delete_description_multiple")
              : t("Employees.cascade_delete_description")
          }
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
  try {
    const messages = pick(
      (await import(`../../../locales/${locale}.json`)).default,
      EmployeesPage.messages,
    );
    return { props: { messages } };
  } catch (error) {
    console.error("Error loading messages:", error);
    return { props: { messages: {} } };
  }
};
