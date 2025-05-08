import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { ProductForm } from "@/product/product.form";

import useProductStore from "@/modules/product/product.store";

export default function AddProductPage() {
  const router = useRouter();
  const t = useTranslations();

  const isLoading = useProductStore((state) => state.isLoading);
  const setIsLoading = useProductStore((state) => state.setIsLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).productForm;
    if (form) {
      form.setValue("name", `Product ${dummyData.randomNumber}`);
      form.setValue("description", dummyData.randomString);
      form.setValue("price", String(dummyData.randomNumber));
      form.setValue("sku", dummyData.randomString);
      form.setValue("stock_quantity", String(dummyData.randomNumber));
    }
  };

  const onAddSuccess = () => {
    toast.success(t("General.successful_operation"), {
      description: t("Products.success.create"),
    });
    router.push("/products");
    setIsLoading(false);
  };

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
        dummyButton={handleDummyData}
      />

      <ProductForm formHtmlId="product-form" onSuccess={onAddSuccess} />
    </div>
  );
}

AddProductPage.messages = ["Pages", "Products", "Forms", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddProductPage.messages,
      ),
    },
  };
};
