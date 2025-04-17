import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";

import { WarehouseCard } from "@/components/app/warehouse/warehouse.card";
import WarehouseTable from "@/components/app/warehouse/warehouse.table";
import DataPageLayout from "@/components/layouts/data-page-layout";

import type { Warehouse } from "@/types/warehouse.type";

import { useWarehouses } from "@/hooks/useWarehouses";

export default function WarehousesPage() {
  const t = useTranslations("Warehouses");
  const { data: warehouses, isLoading, error } = useWarehouses();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filteredWarehouses = warehouses?.filter(
    (warehouse) =>
      warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Render function for a single warehouse card
  const renderWarehouse = (warehouse: Warehouse) => <WarehouseCard warehouse={warehouse} />;

  return (
    <DataPageLayout>
      <PageSearchAndFilter
        title={t("title")}
        createHref="/warehouses/add"
        createLabel={t("create_warehouse")}
        onSearch={setSearchQuery}
        searchPlaceholder={t("search_warehouses")}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
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
              emptyMessage={t("no_warehouses_found")}
              renderItem={renderWarehouse}
              gridCols="3"
            />
          </div>
        )}
      </div>
    </DataPageLayout>
  );
}

// Add getStaticProps for translations
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const effectiveLocale = locale ?? "en";
  return {
    props: {
      messages: (await import(`../../../locales/${effectiveLocale}.json`)).default,
    },
  };
};
