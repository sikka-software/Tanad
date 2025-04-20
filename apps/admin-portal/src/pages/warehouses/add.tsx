import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { WarehouseForm, type WarehouseFormValues } from "@/modules/warehouse/warehouse.form";
import { warehouseKeys } from "@/modules/warehouse/warehouse.hooks";
import { createWarehouse } from "@/modules/warehouse/warehouse.service";
import type { Warehouse, WarehouseCreateData } from "@/modules/warehouse/warehouse.type";
import useUserStore from "@/stores/use-user-store";

export default function AddWarehousePage() {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: WarehouseFormValues) => {
    setLoading(true);
    try {
      const warehouseData = {
        name: data.name.trim(),
        code: data.code.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zip_code: data.zip_code.trim(),
        capacity: data.capacity ? parseFloat(data.capacity) : null,
        is_active: data.is_active,
        notes: data.notes?.trim() || null,
      };

      let result: Warehouse;

      const warehouseCreateData = {
        ...warehouseData,
        user_id: user?.id,
      };
      result = await createWarehouse(warehouseCreateData as WarehouseCreateData);
      toast.success(t("General.successful_operation"), {
        description: t("Warehouses.messages.success_created"),
      });

      const previousWarehouses = queryClient.getQueryData(warehouseKeys.lists()) || [];
      queryClient.setQueryData(warehouseKeys.lists(), [
        ...(Array.isArray(previousWarehouses) ? previousWarehouses : []),
        result,
      ]);

      router.push("/warehouses");
    } catch (error) {
      console.error("Failed to save warehouse:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Warehouses.messages.error_save"),
      });
      setLoading(false);
    }
  };

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

  return (
    <div>
      <CustomPageMeta title={t("Warehouses.add_new")} />
      <PageTitle
        formButtons
        formId="warehouse-form"
        loading={loading}
        onCancel={() => router.push("/warehouses")}
        texts={{
          title: t("Warehouses.add_new"),
          submit_form: t("Warehouses.add_new"),
          cancel: t("General.cancel"),
        }}
        customButton={
          process.env.NODE_ENV === "development" && (
            <Button variant="outline" size="sm" onClick={handleDummyData}>
              Dummy Data
            </Button>
          )
        }
      />

      <div className="mx-auto max-w-2xl p-4">
        <WarehouseForm id="warehouse-form" onSubmit={handleSubmit} />
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
