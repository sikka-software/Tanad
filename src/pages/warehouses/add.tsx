import { useState, useEffect } from "react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { WarehouseForm } from "@/components/forms/warehouse-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";

export default function AddWarehousePage() {
  const router = useRouter();
  const t = useTranslations("Warehouses");
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

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

  return (
    <div>
      <PageTitle
        title={t("add_new")}
        customButton={
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/warehouses")}>
              {t("common.cancel")}
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
              <WarehouseForm
                userId={userId}
              />
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
  const effectiveLocale = locale ?? 'en';
  return {
    props: {
      messages: (
        await import(`../../../locales/${effectiveLocale}.json`)
      ).default,
    },
  };
}; 