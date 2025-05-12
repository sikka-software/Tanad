import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

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
import EmployeesTable from "@/employee/employee.table";

import useEmployeeColumns from "@/modules/employee/employee.columns";
import { EmployeeForm } from "@/modules/employee/employee.form";
import { Employee } from "@/modules/employee/employee.types";
import { useJobs } from "@/modules/job/job.hooks";
import useUserStore from "@/stores/use-user-store";

export default function EmployeesPage() {
  const t = useTranslations();
  const router = useRouter();
  const columns = useEmployeeColumns();

  const { data: jobs } = useJobs();

  const canReadEmployees = useUserStore((state) => state.hasPermission("employees.read"));
  const canCreateEmployees = useUserStore((state) => state.hasPermission("employees.create"));

  const [actionableEmployee, setActionableEmployee] = useState<Employee | null>(null);

  const isFormDialogOpen = useEmployeesStore((state) => state.isFormDialogOpen);
  const setIsFormDialogOpen = useEmployeesStore((state) => state.setIsFormDialogOpen);

  const loadingSaveEmployee = useEmployeesStore((state) => state.isLoading);
  const setLoadingSaveEmployee = useEmployeesStore((state) => state.setIsLoading);

  const viewMode = useEmployeesStore((state) => state.viewMode);
  const isDeleteDialogOpen = useEmployeesStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useEmployeesStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useEmployeesStore((state) => state.selectedRows);
  const setSelectedRows = useEmployeesStore((state) => state.setSelectedRows);
  const clearSelection = useEmployeesStore((state) => state.clearSelection);
  const sortRules = useEmployeesStore((state) => state.sortRules);
  const sortCaseSensitive = useEmployeesStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useEmployeesStore((state) => state.sortNullsFirst);
  const searchQuery = useEmployeesStore((state) => state.searchQuery);
  const filterConditions = useEmployeesStore((state) => state.filterConditions);
  const filterCaseSensitive = useEmployeesStore((state) => state.filterCaseSensitive);
  const getFilteredEmployees = useEmployeesStore((state) => state.getFilteredData);
  const getSortedEmployees = useEmployeesStore((state) => state.getSortedData);
  const columnVisibility = useEmployeesStore((state) => state.columnVisibility);
  const setColumnVisibility = useEmployeesStore((state) => state.setColumnVisibility);

  const { data: employees, isLoading, error } = useEmployees();
  const { mutateAsync: deleteEmployees, isPending: isDeleting } = useBulkDeleteEmployees();
  const { mutate: duplicateEmployee } = useDuplicateEmployee();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: employees,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableEmployee,
    duplicateMutation: duplicateEmployee,
    moduleName: "Employees",
  });

  const handleConfirmDelete = createDeleteHandler(deleteEmployees, {
    loading: "Employees.loading.delete",
    success: "Employees.success.delete",
    error: "Employees.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredEmployees = useMemo(() => {
    return getFilteredEmployees(employees || []);
  }, [employees, getFilteredEmployees, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedEmployees = useMemo(() => {
    return getSortedEmployees(filteredEmployees);
  }, [filteredEmployees, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadEmployees) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta title={t("Employees.title")} description={t("Employees.description")} />
      <DataPageLayout count={employees?.length} itemsText={t("Pages.Employees.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode
            selectedRows={selectedRows}
            clearSelection={clearSelection}
            isDeleting={isDeleting}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          />
        ) : (
          <PageSearchAndFilter
            store={useEmployeesStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Employees.title")}
            onAddClick={
              canCreateEmployees ? () => router.push(router.pathname + "/add") : undefined
            }
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
              data={sortedEmployees}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedEmployees}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
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
          loadingSave={loadingSaveEmployee}
        >
          <EmployeeForm
            formHtmlId={"employee-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableEmployee(null);
            }}
            defaultValues={actionableEmployee}
            editMode={true}
          />
        </FormSheet>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Employees.confirm_delete_title")}
          description={t("Employees.confirm_delete", { count: selectedRows.length })}
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

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        EmployeesPage.messages,
      ),
    },
  };
};
