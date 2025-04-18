import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import { ProductForm, ProductFormValues } from "@/components/app/product/product.form";

import { createProduct } from "@/services/productService";

import type { Product, ProductCreateData } from "@/types/product.type";

import { productKeys } from "@/hooks/useProducts";
import useUserStore from "@/stores/use-user-store";


export default function AddProductPage() {
  const router = useRouter();
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { user } = useUserStore();

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

  const handleDummyData = () => {
    const form = (window as any).productForm;
    if (form) {
      form.setValue("name", "Product 1");
    }
  };

  const handleSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    try {
      const productData = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        price: data.price,
        sku: data.sku?.trim() || null,
        stock_quantity: data.stock_quantity,
      };

      let result: Product;

      const productCreateData = {
        ...productData,
        user_id: user?.id,
      };
      result = await createProduct(productCreateData as ProductCreateData);

      // const response = await fetch("/api/products/create", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     name: data.name.trim(),
      //     description: data.description?.trim() || null,
      //     price: data.price,
      //     sku: data.sku?.trim() || null,
      //     stock_quantity: data.stock_quantity,
      //     user_id: user_id,
      //   }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || t("Products.error.create"));
      // }

      // const result = await response.json();

      toast.success(t("General.successful_operation"), {
        description: t("Products.success.created"),
      });

      onSuccess(result.product);
    } catch (error) {
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Products.error.create"),
      });
    }
  };

  return (
    <div className="">
      <PageTitle
        title={t("Products.add_new")}
        formButtons
        formId="product-form"
        loading={loading}
        onCancel={() => router.push("/products")}
        texts={{
          submit_form: t("Products.add_new"),
          cancel: t("General.cancel"),
        }}
        customButton={
          process.env.NODE_ENV === "development" && (
            <Button variant="outline" size="sm" onClick={handleDummyData}>
              Dummy Data
            </Button>
          )
        }
      />

      <div className="mx-auto max-w-2xl p-4">
        <ProductForm id="product-form" onSubmit={handleSubmit} loading={loading} />
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
