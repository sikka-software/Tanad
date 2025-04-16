import { useEffect } from "react";

import { GetStaticProps, GetStaticPaths } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { VendorForm } from "@/components/forms/vendor-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

import useUserStore from "@/hooks/use-user-store";

export default function EditVendorPage() {
  const router = useRouter();
  const t = useTranslations("Vendors");

  const { id: vendorId } = router.query;

  const { user } = useUserStore();

  useEffect(() => {
    if (router.isReady && !vendorId) {
      console.error("Vendor ID not found in URL");
    }
  }, [router.isReady, vendorId]);

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
            <VendorForm userId={user?.id} vendorId={vendorId as string} />
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
