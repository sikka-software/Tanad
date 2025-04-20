import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { useDeleteHandler } from "@/hooks/use-delete-handler";
import WarehouseCard from "@/modules/warehouse/warehouse.card";
import { useBulkDeleteWarehouses, useWarehouses } from "@/modules/warehouse/warehouse.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/warehouse/warehouse.options";
import useWarehouseStore from "@/modules/warehouse/warehouse.store";
import WarehouseTable from "@/modules/warehouse/warehouse.table";

export default function WarehousesPage() {
  const t = useTranslations();

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
  const { createDeleteHandler } = useDeleteHandler();

  const handleConfirmDelete = createDeleteHandler(deleteWarehouses, {
    loading: "Warehouses.loading.deleting",
    success: "Warehouses.success.deleted",
    error: "Warehouses.error.deleting",
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
            createHref="/warehouses/add"
            createLabel={t("Warehouses.create_warehouse")}
            searchPlaceholder={t("Warehouses.search_warehouses")}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <WarehouseTable
              data={sortedWarehouses}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
