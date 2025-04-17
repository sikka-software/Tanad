import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { Loader2, Trash2, X } from "lucide-react";

import DataPageLayout from "@/components/layouts/data-page-layout";
import EmployeesTable from "@/components/tables/employees-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";

import { Employee } from "@/types/employee.type";

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

  const renderEmployee = (employee: Employee) => (
    <Card key={employee.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold">
          {employee.first_name} {employee.last_name}
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">{employee.email}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{employee.position}</p>
          <p className="text-xs text-gray-500">
            {t("common.created_at")}: {new Date(employee.created_at).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );

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

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Employees.confirm_delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("Employees.confirm_delete", { count: selectedRows.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("General.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("General.deleting")}
                </>
              ) : (
                t("General.delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
