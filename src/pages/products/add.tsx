import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { ProductForm } from "@/components/forms/product-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

export default function AddProductPage() {
  const router = useRouter();
  const t = useTranslations("Products");

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
            <ProductForm />
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
