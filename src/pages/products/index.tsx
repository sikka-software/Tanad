import { useEffect, useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageTitle from "@/components/ui/page-title";
import { Skeleton } from "@/components/ui/skeleton";

// Match the Drizzle schema and potential API response format
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string; // numeric in DB comes as string
  sku: string | null;
  // Handle both snake_case (from API) and camelCase (from Drizzle)
  stockQuantity?: number;
  stock_quantity?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export default function ProductsPage() {
  const t = useTranslations("Products");
  const [dataSource, setDataSource] = useState("");

  const fetchProducts = async (): Promise<Product[]> => {
    // List of endpoints to try, in order of preference
    const endpoints = [
      "/api/get-products", // Direct Postgres query
      "/api/products/all", // Drizzle ORM query
      "/api/products/fallback", // Hardcoded fallback
    ];

    // Helper to fetch with timeout
    const fetchWithTimeout = async (url: string, timeout = 8000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return response;
      } catch (error) {
        clearTimeout(id);
        throw error;
      }
    };

    let lastError = null;

    // Try each endpoint one by one
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying to fetch from ${endpoint}...`);
        const response = await fetchWithTimeout(endpoint);

        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully fetched from ${endpoint}:`, data);

          if (data.products && Array.isArray(data.products)) {
            return data.products;
          }
        }
      } catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error);
        lastError = error;
      }
    }

    // If we got here, all endpoints failed
    throw lastError || new Error("All endpoints failed");
  };

  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    retry: 2,
    retryDelay: 1000,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
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
            value: product.stockQuantity || product.stock_quantity || 0,
          })}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageTitle
        title={t("title")}
        createButtonLink="/products/add"
        createButtonText={t("create_product")}
        createButtonDisabled={isLoading}
      />

      <div className="p-4">
        <DataModelList
          data={products}
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
