import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { useQueryClient } from "@tanstack/react-query";

import { ProductForm } from "@/components/app/product/product.form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

import useUserStore from "@/stores/use-user-store";

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
  const { user } = useUserStore();

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
      />

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Products.product_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              id="product-form"
              onSuccess={handleSuccess}
              user_id={user?.id}
              loading={loading}
              setLoading={setLoading}
              hideFormButtons
            />
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
