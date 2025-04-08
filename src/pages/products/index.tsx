import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import PageTitle from "@/components/ui/page-title";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types/product.type";

export default function ProductsPage() {
  const t = useTranslations("Products");
  const [searchQuery, setSearchQuery] = useState("");
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
        <p className="mb-2 text-gray-600">{product.description || t("no_description")}</p>
        <p className="text-lg font-bold">${Number(product.price).toFixed(2)}</p>
        <p className="text-sm text-gray-500">{t("sku_label", { value: product.sku || "N/A" })}</p>
        <p className="text-sm text-gray-500">
          {t("stock_label", {
            value: product.stockQuantity || 0,
          })}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageSearchAndFilter
        title={t("title")}
        createHref="/products/add"
        createLabel={t("add_new")}
        onSearch={setSearchQuery}
        searchPlaceholder={t("search_products")}
      />

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
