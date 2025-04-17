import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { Trash2, X } from "lucide-react";

import { Button } from "@/ui/button";
import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";

import EmployeeCard from "@/components/app/employee/employee.card";
import EmployeesTable from "@/components/app/employee/employee.table";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { Employee } from "@/types/employee.types";

import { useEmployees, useDeleteEmployee } from "@/hooks/useEmployees";
import { useEmployeesStore } from "@/stores/employees.store";

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
    <DataPageLayout>
      {selectedRows.length > 0 ? (
        <div className="bg-background sticky top-0 z-10 flex !min-h-12 items-center justify-between gap-4 border-b px-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedRows.length} {t("General.items_selected")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              {t("General.clear")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {t("General.delete")}
            </Button>
          </div>
        </div>
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
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
