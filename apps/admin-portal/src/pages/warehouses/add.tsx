import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyWarehouse } from "@/lib/dummy-factory";

import { WarehouseForm } from "@/warehouse/warehouse.form";
import useWarehouseStore from "@/warehouse/warehouse.store";

export default function AddWarehousePage() {
  const t = useTranslations();
  const router = useRouter();

  const setIsLoading = useWarehouseStore((state) => state.setIsLoading);
  const isLoading = useWarehouseStore((state) => state.isLoading);

  return (
    <div>
      <CustomPageMeta title={t("Pages.Warehouses.add")} />
      <PageTitle
        formButtons
        formId="warehouse-form"
        loading={isLoading}
        onCancel={() => router.push("/warehouses")}
        texts={{
          title: t("Pages.Warehouses.add"),
          submit_form: t("Pages.Warehouses.add"),
          cancel: t("General.cancel"),
        }}
        dummyButton={generateDummyWarehouse}
      />

      <WarehouseForm
        formHtmlId="warehouse-form"
        onSuccess={() => {
          router.push("/warehouses").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddWarehousePage.messages = ["Metadata","Notes", "Pages", "Warehouses", "Forms", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddWarehousePage.messages,
      ),
    },
  };
};
