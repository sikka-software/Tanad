import { FormDialog } from "@root/src/components/ui/form-dialog";
import { WarehouseForm } from "@root/src/modules/warehouse/warehouse.form";
import { createModuleStoreHooks } from "@root/src/utils/module-hooks";
import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import WarehouseCard from "@/warehouse/warehouse.card";
import useWarehouseColumns from "@/warehouse/warehouse.columns";
import {
  useBulkDeleteWarehouses,
  useWarehouses,
  useDuplicateWarehouse,
} from "@/warehouse/warehouse.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/warehouse/warehouse.options";
import useWarehouseStore from "@/warehouse/warehouse.store";
import WarehouseTable from "@/warehouse/warehouse.table";

import { WarehouseUpdateData } from "@/modules/warehouse/warehouse.type";

export default function WarehousesPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useWarehouseColumns();

  const moduleHooks = createModuleStoreHooks(useWarehouseStore, "warehouses");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<WarehouseUpdateData | null>(null);

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

  const { data: warehouses, isLoading, error } = useWarehouses();
  const { mutateAsync: deleteWarehouses, isPending: isDeleting } = useBulkDeleteWarehouses();
  const { mutate: duplicateWarehouse } = useDuplicateWarehouse();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: warehouses,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateWarehouse,
    moduleName: "Warehouses",
  });

  const handleConfirmDelete = createDeleteHandler(deleteWarehouses, {
    loading: "Warehouses.loading.delete",
    success: "Warehouses.success.delete",
    error: "Warehouses.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useWarehouseStore((state) => state.data) || [];
  const setData = useWarehouseStore((state) => state.setData);

  useEffect(() => {
    if (warehouses && setData) {
      setData(warehouses);
    }
  }, [warehouses, setData]);

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
        title={t("Pages.Warehouses.title")}
        description={t("Pages.Warehouses.description")}
      />
      <DataPageLayout count={warehouses?.length} itemsText={t("Pages.Warehouses.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode
            selectedRows={selectedRows}
            clearSelection={clearSelection}
            isDeleting={isDeleting}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          />
        ) : (
          <PageSearchAndFilter
            store={useWarehouseStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Warehouses.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Warehouses.create")}
            searchPlaceholder={t("Pages.Warehouses.search")}
            hideOptions={warehouses?.length === 0}
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
            <WarehouseTable
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
                emptyMessage={t("Warehouses.no_warehouses_found")}
                renderItem={(warehouse) => <WarehouseCard warehouse={warehouse} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableItem ? t("Pages.Warehouses.edit") : t("Pages.Warehouses.add")}
          formId="warehouse-form"
          loadingSave={loadingSave}
        >
          <WarehouseForm
            formHtmlId={"warehouse-form"}
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
          title={t("Warehouses.confirm_delete", { count: selectedRows.length })}
          description={t("Warehouses.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
        />
      </DataPageLayout>
    </div>
  );
}

WarehousesPage.messages = ["Notes", "Pages", "Warehouses", "Forms", "General"];

export const getStaticProps: GetStaticProps  = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        WarehousesPage.messages,
      ),
    },
  };
};
