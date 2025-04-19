import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import EmployeeCard from "@/modules/employee/employee.card";
import EmployeesTable from "@/modules/employee/employee.table";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { Employee } from "@/modules/employee/employee.types";

import { useEmployees, useDeleteEmployee } from "@/hooks/models/useEmployees";
import { useEmployeesStore } from "@/modules/employee/employee.store";

export default function EmployeesPage() {
  const t = useTranslations();
  const { data: employees, isLoading, error } = useEmployees();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Get selection state and actions from the store
  const { selectedRows, setSelectedRows, clearSelection } = useEmployeesStore();
  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee();

  const filteredEmployees = employees?.filter(
    (employee) =>
      employee.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedEmployees = selectedRows
    .map((id) => employees?.find((emp) => emp.id === id))
    .filter((emp): emp is Employee => emp !== undefined);

  const handleSelectedRowsChange = (rows: Employee[]) => {
    const newSelectedIds = rows.map((row) => row.id!);
    if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
      setSelectedRows(newSelectedIds);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return;
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Delete each selected employee
      await Promise.all(selectedRows.map((id) => deleteEmployee(id)));
      clearSelection();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete employees:", error);
      setIsDeleteDialogOpen(false);
    }
  };

  const renderEmployee = (employee: Employee) => <EmployeeCard employee={employee} />;

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
            title={t("Employees.title")}
            createHref="/employees/add"
            createLabel={t("Employees.add_new")}
            onSearch={setSearchQuery}
            searchPlaceholder={t("Employees.search_employees")}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}
        <div>
          {viewMode === "table" ? (
            <EmployeesTable
              data={filteredEmployees || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              onSelectedRowsChange={handleSelectedRowsChange}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={filteredEmployees || []}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
                emptyMessage={t("Employees.no_employees_found")}
                renderItem={renderEmployee}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={handleConfirmDelete}
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
