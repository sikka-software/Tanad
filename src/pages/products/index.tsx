import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import DataPageLayout from "@/components/layouts/data-page-layout";
import ProductsTable from "@/components/tables/products-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types/product.type";

export default function ProductsPage() {
  const t = useTranslations("Products");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const { data: products, isLoading, error } = useProducts();

  const filteredProducts = Array.isArray(products)
    ? products.filter(
        (product: Product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
          product.sku?.toLowerCase()?.includes(searchQuery.toLowerCase()),
      )
    : [];

  const renderProduct = (product: Product) => (
    <Card key={product.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold">{product.name}</h3>
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-gray-600 dark:text-gray-400">
          {product.description || t("no_description")}
        </p>
        <p className="text-lg font-bold">${Number(product.price).toFixed(2)}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("sku_label", { value: product.sku || "N/A" })}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("stock_label", {
            value: product.stockQuantity || 0,
          })}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <DataPageLayout>
      <PageSearchAndFilter
        title={t("title")}
        createHref="/products/add"
        createLabel={t("add_new")}
        onSearch={setSearchQuery}
        searchPlaceholder={t("search_products")}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div>
        {viewMode === "table" ? (
          <ProductsTable
            data={filteredProducts}
            isLoading={isLoading}
            error={error as Error | null}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={filteredProducts}
              isLoading={isLoading}
              error={error as Error | null}
              emptyMessage={t("no_products")}
              addFirstItemMessage={t("add_first_product")}
              renderItem={renderProduct}
              gridCols="3"
            />
          </div>
        )}
      </div>
    </DataPageLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
