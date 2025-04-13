import { useState, useEffect } from "react";

import { GetStaticProps, GetStaticPaths } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { VendorForm } from "@/components/forms/vendor-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";

export default function EditVendorPage() {
  const router = useRouter();
  const t = useTranslations("Vendors");
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const { id: vendorId } = router.query;

  useEffect(() => {
    const getUserId = async () => {
      setLoadingUser(true);
      const { data, error } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      } else {
        console.error("User not authenticated:", error);
        router.push("/auth/login");
      }
      setLoadingUser(false);
    };

    getUserId();
  }, [router]);

  useEffect(() => {
    if (router.isReady && !vendorId) {
      console.error("Vendor ID not found in URL");
    }
  }, [router.isReady, vendorId]);

  const handleSuccess = () => {
    // VendorForm handles navigation by default
  };

  return (
    <div>
      <PageTitle
        title={t("edit_vendor")}
        customButton={
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/vendors")}>
              {t("General.cancel")}
            </Button>
          </div>
        }
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("vendor_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUser ? (
              <p>{t("common.loading")}</p>
            ) : userId && typeof vendorId === "string" ? (
              <VendorForm userId={userId} vendorId={vendorId} />
            ) : (
              <p>
                {typeof vendorId !== "string"
                  ? t("error.invalid_vendor_id")
                  : t("error.failed_to_load_user")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: "blocking" };
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const effectiveLocale = locale ?? "en";
  return {
    props: {
      messages: (await import(`../../../../locales/${effectiveLocale}.json`)).default,
    },
  };
};
