import { pick } from "lodash";
import { Building, Plus } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import FormDialog from "@/ui/form-dialog";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { createModuleStoreHooks } from "@/utils/module-hooks";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import DepartmentCard from "@/department/department.card";
import useDepartmentColumns from "@/department/department.columns";
import DepartmentForm from "@/department/department.form";
import {
  useDepartments,
  useBulkDeleteDepartments,
  useDuplicateDepartment,
} from "@/department/department.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/department/department.options";
import useDepartmentsStore from "@/department/department.store";
import DepartmentsTable from "@/department/department.table";
import { DepartmentUpdateData } from "@/department/department.type";

export default function DepartmentsPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useDepartmentColumns();

  const moduleHooks = createModuleStoreHooks(useDepartmentsStore, "departments");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<DepartmentUpdateData | null>(null);

  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();

  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();

  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();

  const selectedRows = moduleHooks.useSelectedRows();
  const setSelectedRows = moduleHooks.useSetSelectedRows();

  const columnVisibility = moduleHooks.useColumnVisibility();
  const setColumnVisibility = moduleHooks.useSetColumnVisibility();

  const viewMode = moduleHooks.useViewMode();
  const clearSelection = moduleHooks.useClearSelection();
  const sortRules = moduleHooks.useSortRules();
  const sortCaseSensitive = moduleHooks.useSortCaseSensitive();
  const sortNullsFirst = moduleHooks.useSortNullsFirst();
  const searchQuery = moduleHooks.useSearchQuery();
  const filterConditions = moduleHooks.useFilterConditions();
  const filterCaseSensitive = moduleHooks.useFilterCaseSensitive();
  const getFilteredData = moduleHooks.useGetFilteredData();
  const getSortedData = moduleHooks.useGetSortedData();

  const { data: departments, isLoading, error } = useDepartments();
  const { mutateAsync: deleteDepartments, isPending: isDeleting } = useBulkDeleteDepartments();
  const { mutate: duplicateDepartment } = useDuplicateDepartment();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: departments,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
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

  const storeData = useDepartmentsStore((state) => state.data) || [];
  const setData = useDepartmentsStore((state) => state.setData);

  useEffect(() => {
    if (departments && setData) {
      setData(departments);
    }
  }, [departments, setData]);

  const filteredData = useMemo(() => {
    return getFilteredData(storeData);
  }, [storeData, getFilteredData, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedData = useMemo(() => {
    return getSortedData(filteredData);
  }, [filteredData, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canRead) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta
        title={t("Pages.Departments.title")}
        description={t("Pages.Departments.description")}
      />
      <DataPageLayout count={departments?.length} itemsText={t("Pages.Departments.title")}>
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
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Departments.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Departments.add")}
            searchPlaceholder={t("Pages.Departments.search")}
            hideOptions={departments?.length === 0}
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
            <DepartmentsTable
              data={sortedData}
              isLoading={isLoading}
              error={error}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedData}
                isLoading={isLoading}
                error={error}
                empty={{
                  title: t("Departments.create_first.title"),
                  description: t("Departments.create_first.description"),
                  add: t("Pages.Departments.add"),
                  icons: [Building, Plus, Building],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(department) => (
                  <DepartmentCard department={department} onActionClicked={onActionClicked} />
                )}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableItem ? t("Pages.Departments.edit") : t("Pages.Departments.add")}
          formId="department-form"
          loadingSave={loadingSave}
        >
          <DepartmentForm
            formHtmlId="department-form"
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableItem(null);
              setLoadingSave(false);
            }}
            defaultValues={actionableItem}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Departments.confirm_delete", { count: selectedRows.length })}
          description={t("Departments.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

DepartmentsPage.messages = ["Notes", "Pages", "Departments", "General", "CommonStatus"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        DepartmentsPage.messages,
      ),
    },
  };
};
