import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import DepartmentCard from "@/modules/department/department.card";
import DepartmentsTable from "@/modules/department/department.table";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { Department } from "@/modules/department/department.type";

import { useDepartments } from "@/modules/department/department.hooks";
import { useDeleteDepartments } from "@/modules/department/department.hooks";
import { useDepartmentsStore } from "@/modules/department/department.store";

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
    <div>
      <CustomPageMeta title={t("Departments.title")} description={t("Departments.description")} />
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

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={handleConfirmDelete}
          title={t("Departments.confirm_delete_title")}
          description={t("Departments.confirm_delete", { count: selectedRows.length })}
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
