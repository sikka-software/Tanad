import { FormDialog } from "@root/src/components/ui/form-dialog";
import { WarehouseForm } from "@root/src/modules/warehouse/warehouse.form";
import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

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
import {
  useBulkDeleteWarehouses,
  useWarehouses,
  useDuplicateWarehouse,
} from "@/warehouse/warehouse.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/warehouse/warehouse.options";
import useWarehouseStore from "@/warehouse/warehouse.store";
import WarehouseTable from "@/warehouse/warehouse.table";

import { Warehouse } from "@/modules/warehouse/warehouse.type";
import useUserStore from "@/stores/use-user-store";

export default function WarehousesPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadWarehouses = useUserStore((state) => state.hasPermission("warehouses.read"));
  const canCreateWarehouses = useUserStore((state) => state.hasPermission("warehouses.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableWarehouse, setActionableWarehouse] = useState<Warehouse | null>(null);

  const loadingSaveWarehouse = useWarehouseStore((state) => state.isLoading);
  const setLoadingSaveWarehouse = useWarehouseStore((state) => state.setIsLoading);

  const viewMode = useWarehouseStore((state) => state.viewMode);
  const isDeleteDialogOpen = useWarehouseStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useWarehouseStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useWarehouseStore((state) => state.selectedRows);
  const setSelectedRows = useWarehouseStore((state) => state.setSelectedRows);
  const clearSelection = useWarehouseStore((state) => state.clearSelection);
  const sortRules = useWarehouseStore((state) => state.sortRules);
  const sortCaseSensitive = useWarehouseStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useWarehouseStore((state) => state.sortNullsFirst);
  const searchQuery = useWarehouseStore((state) => state.searchQuery);
  const filterConditions = useWarehouseStore((state) => state.filterConditions);
  const filterCaseSensitive = useWarehouseStore((state) => state.filterCaseSensitive);
  const getFilteredWarehouses = useWarehouseStore((state) => state.getFilteredData);
  const getSortedWarehouses = useWarehouseStore((state) => state.getSortedData);

  const { data: warehouses, isLoading, error } = useWarehouses();
  const { mutateAsync: deleteWarehouses, isPending: isDeleting } = useBulkDeleteWarehouses();
  const { mutate: duplicateWarehouse } = useDuplicateWarehouse();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: warehouses,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableWarehouse,
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

  const filteredWarehouses = useMemo(() => {
    return getFilteredWarehouses(warehouses || []);
  }, [warehouses, getFilteredWarehouses, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedWarehouses = useMemo(() => {
    return getSortedWarehouses(filteredWarehouses);
  }, [filteredWarehouses, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadWarehouses) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta title={t("Warehouses.title")} description={t("Warehouses.description")} />
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
            store={useWarehouseStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Warehouses.title")}
            onAddClick={
              canCreateWarehouses ? () => router.push(router.pathname + "/add") : undefined
            }
            createLabel={t("Warehouses.create_warehouse")}
            searchPlaceholder={t("Warehouses.search_warehouses")}
            count={warehouses?.length}
            hideOptions={warehouses?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <WarehouseTable
              data={sortedWarehouses}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedWarehouses}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
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
          title={t("Warehouses.edit_warehouse")}
          formId="warehouse-form"
          loadingSave={loadingSaveWarehouse}
        >
          <WarehouseForm
            formHtmlId={"warehouse-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableWarehouse(null);
              setLoadingSaveWarehouse(false);
            }}
            defaultValues={actionableWarehouse}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Warehouses.confirm_delete")}
          description={t("Warehouses.delete_description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

WarehousesPage.messages = ["Notes", "Pages", "Warehouses", "Forms", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        WarehousesPage.messages,
      ),
    },
  };
};
