import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import DepartmentCard from "@/modules/department/department.card";
import { useDepartments } from "@/modules/department/department.hooks";
import { useDeleteDepartments } from "@/modules/department/department.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/department/department.options";
import { useDepartmentsStore } from "@/modules/department/department.store";
import DepartmentsTable from "@/modules/department/department.table";

export default function DepartmentsPage() {
  const t = useTranslations();

  const viewMode = useDepartmentsStore((state) => state.viewMode);
  const isDeleteDialogOpen = useDepartmentsStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useDepartmentsStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useDepartmentsStore((state) => state.selectedRows);
  const setSelectedRows = useDepartmentsStore((state) => state.setSelectedRows);
  const clearSelection = useDepartmentsStore((state) => state.clearSelection);
  const sortRules = useDepartmentsStore((state) => state.sortRules);
  const sortCaseSensitive = useDepartmentsStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useDepartmentsStore((state) => state.sortNullsFirst);
  const searchQuery = useDepartmentsStore((state) => state.searchQuery);
  const filterConditions = useDepartmentsStore((state) => state.filterConditions);
  const filterCaseSensitive = useDepartmentsStore((state) => state.filterCaseSensitive);
  const getFilteredDepartments = useDepartmentsStore((state) => state.getFilteredDepartments);
  const getSortedDepartments = useDepartmentsStore((state) => state.getSortedDepartments);

  const { data: departments, isLoading, error } = useDepartments();
  const { mutate: deleteDepartments, isPending: isDeleting } = useDeleteDepartments();

  const filteredDepartments = useMemo(() => {
    return getFilteredDepartments(departments || []);
  }, [departments, getFilteredDepartments, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedDepartments = useMemo(() => {
    return getSortedDepartments(filteredDepartments);
  }, [filteredDepartments, sortRules, sortCaseSensitive, sortNullsFirst]);

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
            store={useDepartmentsStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Departments.title")}
            createHref="/departments/add"
            createLabel={t("Departments.add_new")}
            searchPlaceholder={t("Departments.search_departments")}
          />
        )}
        <div>
          {viewMode === "table" ? (
            <DepartmentsTable
              data={sortedDepartments}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedDepartments}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
                emptyMessage={t("Departments.no_departments_found")}
                renderItem={(department) => <DepartmentCard department={department} />}
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
