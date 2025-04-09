import { useState, useRef, RefObject, useEffect } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { useQueryClient } from "@tanstack/react-query";

import { ProductForm } from "@/components/forms/product-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";

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
  const formRef = useRef<HTMLFormElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      } else {
        router.push("/auth/login");
      }
    };

    getUserId();
  }, [router]);

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

  const handleSubmitClick = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
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
            <Button type="button" size="sm" onClick={handleSubmitClick}>
              {t("Products.create_product")}
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
            <ProductForm
              onSuccess={handleSuccess}
              userId={userId}
              formRef={formRef as RefObject<HTMLFormElement>}
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
