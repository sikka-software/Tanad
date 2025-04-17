import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import ProductCard from "@/components/app/product/product.card";
import ProductsTable from "@/components/app/product/product.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";

import { Product } from "@/types/product.type";

import { useProducts } from "@/hooks/useProducts";

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
              renderItem={(product) => <ProductCard product={product} />}
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
