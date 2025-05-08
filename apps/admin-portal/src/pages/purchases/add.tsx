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
      form.setValue("purchase_number", dummyData.randomNumber);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Purchases.add_new")} />
      <PageTitle
        formButtons
        formId="purchase-form"
        loading={isLoading}
        onCancel={() => router.push("/purchases")}
        texts={{
          title: t("Purchases.add_new"),
          submit_form: t("Purchases.add_new"),
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

AddPurchasePage.messages = ["Pages", "Purchases", "General"];

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
