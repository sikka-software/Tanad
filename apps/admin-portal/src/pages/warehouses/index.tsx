import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import WarehouseCard from "@/components/app/warehouse/warehouse.card";
import WarehouseTable from "@/components/app/warehouse/warehouse.table";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { useBulkDeleteWarehouses, useWarehouses } from "@/hooks/useWarehouses";
import useWarehousesStore from "@/stores/warehouses.store";

export default function WarehousesPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: warehouses, isLoading, error } = useWarehouses();

  const { selectedRows, clearSelection } = useWarehousesStore();
  const { mutate: deleteItems, isPending: isDeleting } = useBulkDeleteWarehouses();

  const filteredWarehouses = warehouses?.filter(
    (warehouse) =>
      warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
            title={t("Warehouses.title")}
            createHref="/warehouses/add"
            createLabel={t("Warehouses.create_warehouse")}
            onSearch={setSearchQuery}
            searchPlaceholder={t("Warehouses.search_warehouses")}
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
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={filteredWarehouses || []}
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
          handleConfirmDelete={handleConfirmDelete}
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
