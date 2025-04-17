import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import PageTitle from "@/ui/page-title";

import { WarehouseForm } from "@/forms/warehouse-form";

import useUserStore from "@/hooks/use-user-store";
import { warehouseKeys } from "@/hooks/useWarehouses";

export default function AddWarehousePage() {
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { user } = useUserStore();

  const handleSuccess = (warehouse: any) => {
    setLoading(false);
    // Update the warehouses cache to include the new warehouse
    const previousWarehouses = queryClient.getQueryData(warehouseKeys.lists()) || [];
    queryClient.setQueryData(warehouseKeys.lists(), [
      ...(Array.isArray(previousWarehouses) ? previousWarehouses : []),
      warehouse,
    ]);

    // Navigate to warehouses list
    router.push("/warehouses");
  };

  if (!user) {
    router.push("/auth");
  }

  return (
    <div>
      <PageTitle
        title={t("Warehouses.add_new")}
        formButtons
        formId="warehouse-form"
        loading={loading}
        onCancel={() => router.push("/warehouses")}
        texts={{
          submit_form: t("Warehouses.add_new"),
          cancel: t("General.cancel"),
        }}
      />

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Warehouses.warehouse_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <WarehouseForm
              id="warehouse-form"
              user_id={user?.id}
              onSuccess={handleSuccess}
              loading={loading}
              setLoading={setLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const effectiveLocale = locale ?? "en";
  return {
    props: {
      messages: (await import(`../../../locales/${effectiveLocale}.json`)).default,
    },
  };
};
