import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { PurchaseForm } from "@/purchase/purchase.form";
import usePurchaseStore from "@/purchase/purchase.store";

export default function AddPurchasePage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = usePurchaseStore((state) => state.setIsLoading);
  const isLoading = usePurchaseStore((state) => state.isLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).purchaseForm;
    if (form) {
      form.setValue("purchase_number", dummyData.randomString);
      form.setValue("description", dummyData.randomString);
      form.setValue("amount", dummyData.randomNumber(4));
      form.setValue("category", dummyData.randomString);
      form.setValue("status", dummyData.randomPicker(["draft"]));
      form.setValue("issue_date", String(dummyData.randomDate));
      form.setValue("due_date", String(dummyData.randomDate));
      form.setValue("incurred_at", String(dummyData.randomDate));
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Pages.Purchases.add")} />
      <PageTitle
        formButtons
        formId="purchase-form"
        loading={isLoading}
        onCancel={() => router.push("/purchases")}
        texts={{
          title: t("Pages.Purchases.add"),
          submit_form: t("Pages.Purchases.add"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <PurchaseForm
        formHtmlId="purchase-form"
        onSuccess={() => {
          router.push("/purchases");
          setIsLoading(false);
        }}
      />
    </div>
  );
}

AddPurchasePage.messages = ["Notes", "Pages", "Purchases", "Forms", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddPurchasePage.messages,
      ),
    },
  };
};
