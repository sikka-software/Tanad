import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import { ProductForm, ProductFormValues } from "@/modules/product/product.form";
import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { createProduct } from "@/services/productService";

import type { Product, ProductCreateData } from "@/types/product.type";

import { productKeys } from "@/hooks/models/useProducts";
import useUserStore from "@/stores/use-user-store";

export default function AddProductPage() {
  const router = useRouter();
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const [loading, setLoading] = useState(false);

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
      result = await createProduct(productCreateData as unknown as ProductCreateData);
      toast.success(t("General.successful_operation"), {
        description: t("Products.success.created"),
      });

      const previousProducts = queryClient.getQueryData(productKeys.lists()) || [];
      queryClient.setQueryData(productKeys.lists(), [
        ...(Array.isArray(previousProducts) ? previousProducts : []),
        result,
      ]);

      router.push("/products");
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Products.error.create"),
      });
      setLoading(false);
    }
  };

  const handleDummyData = () => {
    const form = (window as any).productForm;
    if (form) {
      form.setValue("name", "Product 1");
      form.setValue("description", "Description 1");
      form.setValue("price", "100");
      form.setValue("sku", Math.random().toString(36).substring(2, 15));
      form.setValue("stock_quantity", "100");
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Products.add_new")} />
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
