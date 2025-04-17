import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { Loader2, Trash2, X } from "lucide-react";

import DepartmentCard from "@/components/app/department/department.card";
import DepartmentsTable from "@/components/app/department/department.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
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
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";

import { Department } from "@/types/department.type";

import { useDepartments } from "@/hooks/useDepartments";
import { useDeleteDepartments } from "@/hooks/useDepartments";
import { useDepartmentsStore } from "@/stores/departments.store";

export default function DepartmentsPage() {
  const t = useTranslations();
  const { data: departments, isLoading, error } = useDepartments();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Get selection state and actions from the store
  const { selectedRows, setSelectedRows, clearSelection } = useDepartmentsStore();
  const { mutate: deleteDepartments, isPending: isDeleting } = useDeleteDepartments();

  const filteredDepartments = departments?.filter(
    (department) =>
      department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      department.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedDepartments = selectedRows
    .map((id) => departments?.find((dept) => dept.id === id))
    .filter((dept): dept is Department => dept !== undefined);

  const handleSelectedRowsChange = (rows: Department[]) => {
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
      await deleteDepartments(selectedRows);
      clearSelection();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete departments:", error);
      setIsDeleteDialogOpen(false);
    }
  };

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
          title={t("Departments.title")}
          createHref="/departments/add"
          createLabel={t("Departments.add_new")}
          onSearch={setSearchQuery}
          searchPlaceholder={t("Departments.search_departments")}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}
      <div>
        {viewMode === "table" ? (
          <DepartmentsTable
            data={filteredDepartments || []}
            isLoading={isLoading}
            error={error instanceof Error ? error : null}
            onSelectedRowsChange={handleSelectedRowsChange}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={filteredDepartments || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              emptyMessage={t("Departments.no_departments_found")}
              renderItem={(department: Department) => <DepartmentCard department={department} />}
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
            <AlertDialogTitle>{t("Departments.confirm_delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("Departments.confirm_delete", { count: selectedRows.length })}
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
