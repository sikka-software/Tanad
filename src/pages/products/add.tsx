import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ProductForm, ProductFormValues } from "@/components/forms/product-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

// Define the Product type
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  sku: string | null;
  stock_quantity: number;
  [key: string]: any; // For any other properties
}

export default function AddProductPage() {
  const router = useRouter();
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleSuccess = (newProduct: Product) => {
    // Update the products cache to include the new product
    const previousProducts = queryClient.getQueryData(["products"]) || [];
    queryClient.setQueryData(
      ["products"],
      [...(Array.isArray(previousProducts) ? previousProducts : []), newProduct],
    );

    // Navigate to products list
    router.push("/products");
  };

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/products/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name.trim(),
          description: data.description?.trim() || null,
          price: data.price,
          sku: data.sku?.trim() || null,
          stock_quantity: data.stock_quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("Products.error.create"));
      }

      const result = await response.json();

      toast.success(t("Products.success.title"), {
        description: t("Products.success.created"),
      });

      handleSuccess(result.product);
    } catch (error) {
      toast.error(t("Products.error.title"), {
        description: error instanceof Error ? error.message : t("Products.error.create"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <PageTitle
        title={t("Products.add_new")}
        createButtonLink="/products"
        createButtonText={t("Products.back_to_list")}
        customButton={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push("/products")}
            >
              {t("General.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? t("Products.creating_product") : t("Products.create_product")}
            </Button>
          </div>
        }
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Products.product_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm onSubmit={onSubmit} loading={loading} />
          </CardContent>
        </Card>
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
