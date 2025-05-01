import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import EmployeeCard from "@/employee/employee.card";
import { useEmployees, useBulkDeleteEmployees } from "@/employee/employee.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/employee/employee.options";
import useEmployeesStore from "@/employee/employee.store";
import EmployeesTable from "@/employee/employee.table";

import useUserStore from "@/stores/use-user-store";

export default function EmployeesPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadEmployees = useUserStore((state) => state.hasPermission("employees.read"));
  const canCreateEmployees = useUserStore((state) => state.hasPermission("employees.create"));

  const viewMode = useEmployeesStore((state) => state.viewMode);
  const isDeleteDialogOpen = useEmployeesStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useEmployeesStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useEmployeesStore((state) => state.selectedRows);
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
  const { createDeleteHandler } = useDeleteHandler();

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
              data={filteredEmployees || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={filteredEmployees || []}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
                emptyMessage={t("Employees.no_employees_found")}
                renderItem={(employee) => <EmployeeCard employee={employee} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

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
