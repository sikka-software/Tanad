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
  const t = useTranslations("Warehouses");
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
        title={t("add_new")}
        customButton={
          <div className="flex gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/warehouses")}>
              {t("General.cancel")}
            </Button>
          </div>
        }
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("warehouse_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUser ? (
              <p>{t("common.loading")}</p>
            ) : userId ? (
              <WarehouseForm userId={userId} onSuccess={handleSuccess} />
            ) : (
              <p>{t("error.failed_to_load_user")}</p>
            )}
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
