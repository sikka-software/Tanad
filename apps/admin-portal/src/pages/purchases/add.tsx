import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyPurchase } from "@/lib/dummy-factory";

import { PurchaseForm } from "@/purchase/purchase.form";
import usePurchaseStore from "@/purchase/purchase.store";

export default function AddPurchasePage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = usePurchaseStore((state) => state.setIsLoading);
  const isLoading = usePurchaseStore((state) => state.isLoading);

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
        dummyButton={generateDummyPurchase}
      />

      <PurchaseForm
        formHtmlId="purchase-form"
        onSuccess={() => {
          router.push("/purchases").then(() => {
            setIsLoading(false);
          });
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
