import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";

import { WarehouseCard } from "@/components/app/warehouse/warehouse.card";
import WarehouseTable from "@/components/app/warehouse/warehouse.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import ConfirmDelete from "@/components/ui/confirm-delete";
import SelectionMode from "@/components/ui/selection-mode";

import type { Warehouse } from "@/types/warehouse.type";

import { useBulkDeleteWarehouses, useWarehouses } from "@/hooks/useWarehouses";
import useWarehousesStore from "@/stores/warehouses.store";

export default function WarehousesPage() {
  const t = useTranslations("Warehouses");
  const { data: warehouses, isLoading, error } = useWarehouses();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { selectedRows, setSelectedRows, clearSelection, bulkDeleteWarehouses } =
    useWarehousesStore();
  const { mutate: deleteItems, isPending: isDeleting } = useBulkDeleteWarehouses();

  const filteredWarehouses = warehouses?.filter(
    (warehouse) =>
      warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRowSelectionChange = (rows: Warehouse[]) => {
    setSelectedRows(rows.map((row) => row.id));
  };

  const handleDeleteSelected = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteItems(selectedRows);
      clearSelection();
    } catch (error) {
      console.error("Error deleting warehouses:", error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // Render function for a single warehouse card
  const renderWarehouse = (warehouse: Warehouse) => <WarehouseCard warehouse={warehouse} />;

  return (
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
          title={t("title")}
          createHref="/warehouses/add"
          createLabel={t("create_warehouse")}
          onSearch={setSearchQuery}
          searchPlaceholder={t("search_warehouses")}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}

      <div>
        {viewMode === "table" ? (
          <WarehouseTable
            data={filteredWarehouses || []}
            isLoading={isLoading}
            error={error instanceof Error ? error : null}
            onSelectedRowsChange={handleRowSelectionChange}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={filteredWarehouses || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              emptyMessage={t("no_warehouses_found")}
              renderItem={renderWarehouse}
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
        title={t("confirm_delete")}
        description={t("delete_description", { count: selectedRows.length })}
      />
    </DataPageLayout>
  );
}

// Add getStaticProps for translations
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
