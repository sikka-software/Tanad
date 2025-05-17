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

import OfficeCard from "@/office/office.card";
import useOfficeColumns from "@/office/office.columns";
import { OfficeForm } from "@/office/office.form";
import { useOffices, useBulkDeleteOffices, useDuplicateOffice } from "@/office/office.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/office/office.options";
import useOfficeStore from "@/office/office.store";
import OfficesTable from "@/office/office.table";
import { OfficeUpdateData } from "@/office/office.type";

export default function OfficesPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useOfficeColumns();

  const moduleHooks = createModuleStoreHooks(useOfficeStore, "offices");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableOffice, setActionableOffice] = useState<OfficeUpdateData | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  // Permissions
  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();
  // Loading
  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();
  // Delete Dialog
  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();
  // Selected Rows
  const selectedRows = moduleHooks.useSelectedRows();
  const setSelectedRows = moduleHooks.useSetSelectedRows();
  const clearSelection = moduleHooks.useClearSelection();
  // Column Visibility
  const columnVisibility = moduleHooks.useColumnVisibility();
  const setColumnVisibility = moduleHooks.useSetColumnVisibility();
  // Sorting
  const sortRules = moduleHooks.useSortRules();
  const sortCaseSensitive = moduleHooks.useSortCaseSensitive();
  const sortNullsFirst = moduleHooks.useSortNullsFirst();
  const setSortRules = moduleHooks.useSetSortRules();
  // Filtering
  const filterConditions = moduleHooks.useFilterConditions();
  const filterCaseSensitive = moduleHooks.useFilterCaseSensitive();
  const getFilteredData = moduleHooks.useGetFilteredData();
  const getSortedData = moduleHooks.useGetSortedData();
  // Misc
  const searchQuery = moduleHooks.useSearchQuery();
  const viewMode = moduleHooks.useViewMode();

  const { data: offices, isLoading, error } = useOffices();
  const { mutateAsync: deleteOffices, isPending: isDeleting } = useBulkDeleteOffices();
  const { mutate: duplicateOffice } = useDuplicateOffice();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: offices,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableOffice,
    duplicateMutation: duplicateOffice,
    moduleName: "Offices",
  });

  const handleConfirmDelete = createDeleteHandler(deleteOffices, {
    loading: "Offices.loading.delete",
    success: "Offices.success.delete",
    error: "Offices.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useOfficeStore((state) => state.data) || [];
  const setData = useOfficeStore((state) => state.setData);

  useEffect(() => {
    if (offices && setData) {
      setData(offices);
    }
  }, [offices, setData]);

  const filteredData = useMemo(() => {
    return getFilteredData(storeData);
  }, [storeData, getFilteredData, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedData = useMemo(() => {
    return getSortedData(filteredData);
  }, [filteredData, sortRules, sortCaseSensitive, sortNullsFirst]);

  const tanstackSorting = useMemo(
    () => sortRules.map((rule) => ({ id: rule.field, desc: rule.direction === "desc" })),
    [sortRules],
  );
  const handleTanstackSortingChange = (
    updater:
      | ((prev: { id: string; desc: boolean }[]) => { id: string; desc: boolean }[])
      | { id: string; desc: boolean }[],
  ) => {
    let nextSorting = typeof updater === "function" ? updater(tanstackSorting) : updater;
    const newSortRules = nextSorting.map((s: { id: string; desc: boolean }) => ({
      field: s.id,
      direction: (s.desc ? "desc" : "asc") as "asc" | "desc",
    }));
    setSortRules(newSortRules);
  };

  if (!canRead) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta
        title={t("Pages.Offices.title")}
        description={t("Pages.Offices.description")}
      />
      <DataPageLayout count={offices?.length} itemsText={t("Pages.Offices.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode store={useOfficeStore} isDeleting={isDeleting} />
        ) : (
          <PageSearchAndFilter
            store={useOfficeStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Offices.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Offices.add")}
            searchPlaceholder={t("Pages.Offices.search")}
            hideOptions={offices?.length === 0}
          />
        )}

        <div className="bg--200">
          {viewMode === "table" ? (
            <OfficesTable
              data={sortedData}
              isLoading={isLoading}
              error={error}
              onActionClicked={onActionClicked}
              sorting={tanstackSorting}
              onSortingChange={handleTanstackSortingChange}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedData}
                isLoading={isLoading}
                error={error}
                empty={{
                  title: t("Offices.create_first.title"),
                  description: t("Offices.create_first.description"),
                  add: t("Pages.Offices.add"),
                  icons: [Building, Plus, Building],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(office) => (
                  <OfficeCard office={office} onActionClicked={onActionClicked} />
                )}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableOffice ? t("Pages.Offices.edit") : t("Pages.Offices.add")}
          formId="office-form"
          loadingSave={loadingSave}
        >
          <OfficeForm
            formHtmlId="office-form"
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableOffice(null);
              setLoadingSave(false);
            }}
            defaultValues={actionableOffice}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(pendingDeleteIds)}
          title={t("Offices.confirm_delete", { count: selectedRows.length })}
          description={t("Offices.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

OfficesPage.messages = [
  "Metadata",
  "Offices",
  "Pages",
  "Employees",
  "Jobs",
  "Forms",
  "Departments",
  "General",
  "Notes",
  "CommonStatus",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        OfficesPage.messages,
      ),
    },
  };
};
