import { GetStaticProps, GetStaticPaths } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { VendorForm } from "@/components/app/vendor/vendor.form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

import useUserStore from "@/hooks/use-user-store";

export default function EditVendorPage() {
  const router = useRouter();
  const t = useTranslations("Vendors");

  const { id: vendor_id } = router.query;

  const { user } = useUserStore();

  useEffect(() => {
    if (router.isReady && !vendor_id) {
      console.error("Vendor ID not found in URL");
    }
  }, [router.isReady, vendor_id]);

  const handleSuccess = () => {
    // VendorForm handles navigation by default
  };

  if (!user) {
    router.push("/auth");
  }

  return (
    <div>
      <PageTitle
        title={t("edit_vendor")}
        customButton={
          <div className="flex gap-2">
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
            <VendorForm user_id={user?.id} vendor_id={vendor_id as string} />
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
  return {
    props: {
      messages: (await import(`../../../../locales/${locale}.json`)).default,
    },
  };
};
