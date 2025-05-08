import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import PageTitle from "@/components/ui/page-title";

import { WarehouseForm } from "@/modules/warehouse/warehouse.form";
import useWarehouseStore from "@/modules/warehouse/warehouse.store";

export default function AddWarehousePage() {
  const t = useTranslations();
  const router = useRouter();

  const setIsLoading = useWarehouseStore((state) => state.setIsLoading);
  const isLoading = useWarehouseStore((state) => state.isLoading);

  const handleDummyData = () => {
    const form = (window as any).warehouseForm;
    if (form) {
      // code randomly
      form.setValue("code", "WR-" + Math.random().toString(36).substring(2, 5).toUpperCase());
      form.setValue("name", "Warehouse 1");
      form.setValue("address", "123 Main St");
      form.setValue("city", "Anytown");
      form.setValue("state", "CA");
      form.setValue("zip_code", "12345");
      form.setValue("phone", "123-456-7890");
      form.setValue("email", "warehouse@example.com");
      form.setValue("notes", "This is a dummy warehouse");
    }
  };

  const onAddSuccess = () => {
    toast.success(t("General.successful_operation"), {
      description: t("Warehouses.success.create"),
    });
    router.push("/warehouses");
    setIsLoading(false);
  };

  return (
    <div>
      <CustomPageMeta title={t("Warehouses.add_new")} />
      <PageTitle
        formButtons
        formId="warehouse-form"
        loading={isLoading}
        onCancel={() => router.push("/warehouses")}
        texts={{
          title: t("Warehouses.add_new"),
          submit_form: t("Warehouses.add_new"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <WarehouseForm formHtmlId="warehouse-form" onSuccess={onAddSuccess} />
    </div>
  );
}

AddWarehousePage.messages = ["Pages", "Warehouses", "Forms", "General"];

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
