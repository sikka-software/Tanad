import { useState, useEffect } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { useQueryClient } from "@tanstack/react-query";

import { WarehouseForm } from "@/components/forms/warehouse-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { warehouseKeys } from "@/hooks/useWarehouses";
import { supabase } from "@/lib/supabase";

export default function AddWarehousePage() {
  const router = useRouter();
  const t = useTranslations();
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const queryClient = useQueryClient();

  // Fetch user ID on mount
  useEffect(() => {
    const getUserId = async () => {
      setLoadingUser(true);
      const { data, error } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      } else {
        // Redirect to login if not authenticated
        console.error("User not authenticated:", error);
        router.push("/auth/login");
      }
      setLoadingUser(false);
    };

    getUserId();
  }, [router]);

  const handleSuccess = (warehouse: any) => {
    // Update the warehouses cache to include the new warehouse
    const previousWarehouses = queryClient.getQueryData(warehouseKeys.lists()) || [];
    queryClient.setQueryData(warehouseKeys.lists(), [
      ...(Array.isArray(previousWarehouses) ? previousWarehouses : []),
      warehouse,
    ]);

    // Navigate to warehouses list
    router.push("/warehouses");
  };

  return (
    <div>
      <PageTitle
        title={t("Warehouses.add_new")}
        formButtons
        formId="warehouse-form"
        // loading={loading}
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
            <WarehouseForm userId={userId} onSuccess={handleSuccess} />
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
