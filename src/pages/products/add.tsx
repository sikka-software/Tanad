import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";

import { ProductForm } from "@/components/forms/product-form";
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
  const t = useTranslations("Products");
  const queryClient = useQueryClient();

  const handleSuccess = (newProduct: Product) => {
    // Update the products cache to include the new product
    const previousProducts = queryClient.getQueryData(["products"]) || [];
    queryClient.setQueryData(
      ["products"],
      [...(Array.isArray(previousProducts) ? previousProducts : []), newProduct]
    );
    
    // Navigate to products list
    router.push("/products");
  };

  return (
    <div className="">
      <PageTitle
        title={t("add_new")}
        createButtonLink="/products"
        createButtonText={t("back_to_list")}
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("product_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm onSuccess={handleSuccess} />
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
