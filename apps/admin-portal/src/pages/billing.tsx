// Components
import { pick } from "lodash";
import { CreditCard, Package, User } from "lucide-react";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import PageTitle from "@/ui/page-title";
import { Skeleton } from "@/ui/skeleton";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import useUserStore from "@/stores/use-user-store";

export default function Billing() {
  const t = useTranslations();
  const { profile, loading } = useUserStore();

  // Show a skeleton while loading
  if (loading) {
    return (
      <>
        <CustomPageMeta title={t("Billing.title")} description={t("Billing.description")} />
        <PageTitle texts={{ title: t("Billing.title") }} />
        <main className="space-y-6 p-4">
          <Skeleton className="h-64 w-full" />
        </main>
      </>
    );
  }

  return (
    <>
      <CustomPageMeta title={t("Billing.title")} description={t("Billing.description")} />
      <PageTitle texts={{ title: t("Billing.title") }} />
      <main className="space-y-6 p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Billing.subscription_info")}</CardTitle>
            <CardDescription>{t("Billing.manage_subscription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-5 w-5" />
                <span>{t("Billing.customer_id")}: </span>
                <span className="font-mono text-sm">
                  {profile?.stripe_customer_id || t("General.none")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Package className="text-muted-foreground h-5 w-5" />
                <span>{t("Billing.plan")}: </span>
                <span className="font-medium">
                  {profile?.subscribed_to || t("Billing.free_plan")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CreditCard className="text-muted-foreground h-5 w-5" />
                <span>{t("Billing.payment_method")}: </span>
                <span>{t("General.none")}</span>
              </div>

              <div className="mt-6 text-center">{t("General.coming_soon")}</div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

Billing.messages = ["Pages", "Billing", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../locales/${locale}.json`)).default, Billing.messages),
    },
  };
};
