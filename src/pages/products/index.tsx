import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import PageTitle from "@/components/ui/page-title";
import { GetStaticProps } from "next";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sku: string | null;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("Products");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products/all");
        if (!response.ok) {
          throw new Error(t("error.fetch"));
        }
        const data = await response.json();

        setProducts(data.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("error.fetch"));
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [t]);

  if (loading) {
    return (
      <div className="mx-auto space-y-4">
        <PageTitle
          title={t("title")}
          createButtonLink="/products/add"
          createButtonText={t("create_product")}
          createButtonDisabled
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <PageTitle
        title={t("title")}
        createButtonLink="/products/add"
        createButtonText={t("create_product")}
      />
      <div className="p-4">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t("no_products")}</p>
            <Link
              href="/products/add"
              className="text-primary hover:text-primary/90 mt-2 inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("add_first_product")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card
                key={product.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">
                    {product.description || t("no_description")}
                  </p>
                  <p className="text-lg font-bold">
                    ${Number(product.price).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t("sku_label", { value: product.sku || "N/A" })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t("stock_label", { value: product.stock_quantity })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
