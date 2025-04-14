import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { Code, MapPin, LayoutGrid, NotebookText } from "lucide-react";

import DataPageLayout from "@/components/layouts/data-page-layout";
import WarehouseTable from "@/components/tables/warehouse-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import { useWarehouses } from "@/hooks/useWarehouses";
import type { Warehouse } from "@/types/warehouse.type";

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
  const renderWarehouse = (warehouse: Warehouse) => (
    <Card key={warehouse.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{warehouse.name}</h3>
          <Badge variant={warehouse.is_active ? "default" : "secondary"}>
            {warehouse.is_active ? t("status.active") : t("status.inactive")}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Code className="h-4 w-4" />
          <span>{warehouse.code}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p>{warehouse.address}</p>
              <p>{`${warehouse.city}, ${warehouse.state} ${warehouse.zip_code}`}</p>
            </div>
          </div>
          {/* Capacity */}
          {warehouse.capacity && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <LayoutGrid className="h-4 w-4" />
              <span>{`${t("capacity")}: ${warehouse.capacity}`}</span>
            </div>
          )}
          {/* Notes */}
          {warehouse.notes && (
            <div className="flex items-start gap-2 border-t pt-3 text-sm text-gray-500">
              <NotebookText className="mt-1 h-4 w-4 flex-shrink-0" />
              <p className="whitespace-pre-wrap">{warehouse.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
