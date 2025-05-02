import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import { FormDialog } from "@/components/ui/form-dialog";

import EmployeeCard from "@/employee/employee.card";
import {
  useEmployees,
  useBulkDeleteEmployees,
  useDuplicateEmployee,
} from "@/employee/employee.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/employee/employee.options";
import useEmployeesStore from "@/employee/employee.store";
import EmployeesTable from "@/employee/employee.table";

import { EmployeeForm } from "@/modules/employee/employee.form";
import { Employee } from "@/modules/employee/employee.types";
import useUserStore from "@/stores/use-user-store";

export default function EmployeesPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadEmployees = useUserStore((state) => state.hasPermission("employees.read"));
  const canCreateEmployees = useUserStore((state) => state.hasPermission("employees.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableEmployee, setActionableEmployee] = useState<Employee | null>(null);

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
    loading: "Employees.loading.deleting",
    success: "Employees.success.deleted",
    error: "Employees.error.deleting",
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
      <DataPageLayout>
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
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Employees.title")}
            onAddClick={
              canCreateEmployees ? () => router.push(router.pathname + "/add") : undefined
            }
            createLabel={t("Employees.add_new")}
            searchPlaceholder={t("Employees.search_employees")}
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
                emptyMessage={t("Employees.no_employees_found")}
                renderItem={(employee) => <EmployeeCard employee={employee} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Employees.add_new")}
          formId="employee-form"
          loadingSave={loadingSaveEmployee}
        >
          <EmployeeForm
            id={"employee-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableEmployee(null);
              setLoadingSaveEmployee(false);
              toast.success(t("General.successful_operation"), {
                description: t("Employees.success.updated"),
              });
            }}
            defaultValues={actionableEmployee}
            editMode={true}
          />
        </FormDialog>

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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
