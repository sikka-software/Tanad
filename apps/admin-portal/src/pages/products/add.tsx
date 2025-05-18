import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyProduct } from "@/lib/dummy-factory";

import { ProductForm } from "@/product/product.form";
import useProductStore from "@/product/product.store";

export default function AddProductPage() {
  const router = useRouter();
  const t = useTranslations();

  const isLoading = useProductStore((state) => state.isLoading);
  const setIsLoading = useProductStore((state) => state.setIsLoading);

  return (
    <div>
      <CustomPageMeta title={t("Pages.Products.add")} />
      <PageTitle
        formButtons
        formId="product-form"
        loading={isLoading}
        onCancel={() => router.push("/products")}
        texts={{
          title: t("Pages.Products.add"),
          submit_form: t("Pages.Products.add"),
          cancel: t("General.cancel"),
        }}
        dummyButton={generateDummyProduct}
      />

      <ProductForm
        formHtmlId="product-form"
        onSuccess={() => {
          router.push("/products").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddProductPage.messages = ["Metadata", "Notes", "Pages", "Products", "Forms", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const messages = pick(
      (await import(`../../../locales/${locale}.json`)).default,
      AddProductPage.messages,
    );
    return { props: { messages } };
  } catch (error) {
    console.error("Error loading messages:", error);
    return { props: { messages: {} } };
  }
};
