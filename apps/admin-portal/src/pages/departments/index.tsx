import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import { FormDialog } from "@/ui/form-dialog";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import DepartmentCard from "@/department/department.card";
import DepartmentForm from "@/department/department.form";
import {
  useDepartments,
  useBulkDeleteDepartments,
  useDuplicateDepartment,
} from "@/department/department.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/department/department.options";
import useDepartmentsStore from "@/department/department.store";
import DepartmentsTable from "@/department/department.table";
import { Department } from "@/department/department.type";

import useUserStore from "@/stores/use-user-store";

export default function DepartmentsPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadDepartments = useUserStore((state) => state.hasPermission("departments.read"));
  const canCreateDepartments = useUserStore((state) => state.hasPermission("departments.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableDepartment, setActionableDepartment] = useState<Department | null>(null);

  const loadingSaveDepartment = useDepartmentsStore((state) => state.isLoading);
  const setLoadingSaveDepartment = useDepartmentsStore((state) => state.setIsLoading);
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
  const getFilteredDepartments = useDepartmentsStore((state) => state.getFilteredData);
  const getSortedDepartments = useDepartmentsStore((state) => state.getSortedData);

  const { data: departments, isLoading, error } = useDepartments();
  const { mutate: duplicateDepartment } = useDuplicateDepartment();
  const { mutateAsync: deleteDepartments, isPending: isDeleting } = useBulkDeleteDepartments();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: departments,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableDepartment,
    duplicateMutation: duplicateDepartment,
    moduleName: "Departments",
  });

  const handleConfirmDelete = createDeleteHandler(deleteDepartments, {
    loading: "Departments.loading.delete",
    success: "Departments.success.delete",
    error: "Departments.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredDepartments = useMemo(() => {
    return getFilteredDepartments(departments || []);
  }, [departments, getFilteredDepartments, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedDepartments = useMemo(() => {
    return getSortedDepartments(filteredDepartments);
  }, [filteredDepartments, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadDepartments) {
    return <NoPermission />;
  }

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
            onAddClick={
              canCreateDepartments ? () => router.push(router.pathname + "/add") : undefined
            }
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
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedDepartments}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
                emptyMessage={t("Departments.no_departments_found")}
                renderItem={(department) => (
                  <DepartmentCard key={department.id} department={department} />
                )}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Departments.edit")}
          formId="department-form"
          loadingSave={loadingSaveDepartment}
        >
          <DepartmentForm
            formHtmlId="department-form"
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableDepartment(null);
              setLoadingSaveDepartment(false);
              toast.success(t("General.successful_operation"), {
                description: t("Departments.success.update"),
              });
            }}
            defaultValues={actionableDepartment}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
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
