import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { ProductForm } from "@/product/product.form";

import useProductStore from "@/modules/product/product.store";
import useUserStore from "@/stores/use-user-store";

export default function AddProductPage() {
  const router = useRouter();
  const t = useTranslations();

  const isLoading = useProductStore((state) => state.isLoading);

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
        formButtons
        formId="product-form"
        loading={isLoading}
        onCancel={() => router.push("/products")}
        texts={{
          title: t("Products.add_new"),
          submit_form: t("Products.add_new"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <ProductForm id="product-form" />
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
