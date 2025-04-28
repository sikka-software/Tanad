"use client";

import { Info } from "lucide-react";
import { GetStaticProps } from "next";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import CurrentPlan from "@/components/billing/CurrentPlan";
import SubscriptionSelection from "@/components/billing/SubscriptionSelection";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useSubscription } from "@/hooks/use-subscription";
import useUserStore from "@/stores/use-user-store";

export default function Billing() {
  const t = useTranslations();
  const locale = useLocale();
  const { user } = useUserStore();
  const subscription = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  // Cleanup subscription on unmount
  useEffect(() => {
    // Keep track of component mount status
    let mounted = true;

    // Return cleanup function
    return () => {
      mounted = false;
      // Clear any refresh timers or flags
      window.lastSubscriptionRefresh = undefined;
    };
  }, []);

  // Show subscription management for active subscriptions (including canceled ones)
  const showSubscriptionManagement =
    subscription.status === "active" && subscription.name !== t("Billing.free_plan");

  // Show subscription selection for new/free/expired users
  const showSubscriptionSelection =
    !subscription.loading &&
    (!subscription.status || // No subscription
      subscription.status === "canceled" || // Canceled subscription
      subscription.status === "incomplete_expired" || // Failed subscription
      subscription.status === "unpaid" || // Unpaid subscription
      (subscription.status === "active" && subscription.price === "0") || // Free plan
      (subscription.cancelAt && new Date(Number(subscription.cancelAt) * 1000) < new Date())); // Expired subscription

  if (!user) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  // Format the next billing date if available
  const formatNextBillingDate = () => {
    if (!subscription.nextBillingDate || subscription.nextBillingDate === "-") return null;

    try {
      let date;
      if (subscription.nextBillingDate.includes("/")) {
        // Parse DD/MM/YYYY format
        const parts = subscription.nextBillingDate.split("/");
        date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        // Try to parse as regular date
        date = new Date(subscription.nextBillingDate);
      }

      if (isNaN(date.getTime())) return subscription.nextBillingDate;

      // Format the date
      return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return subscription.nextBillingDate;
    }
  };

  const nextBillingDate = formatNextBillingDate();

  return (
    <>
      <CustomPageMeta title={t("Billing.title")} description={t("Billing.description")} />
      {/* Show subscription selection for new/free/expired users */}
      <main
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold">{t("Billing.title")}</h1>
          <p className="text-muted-foreground">
            {t("Billing.manage_description", {
              fallback: "Manage your subscription and billing information",
            })}
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="mb-10">
          <CurrentPlan />
        </div>

        {/* Available Plans */}

        {/* Subscription Selection Section - with Tabs */}
        {showSubscriptionSelection && (
          <div className="w-full" id="plans">
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold">{t("Billing.available_plans")}</h2>
              <p className="text-muted-foreground">
                {t("Billing.choose_plan_description", {
                  fallback: "Choose the plan that works best for you and your team",
                })}
              </p>
            </div>
            <Tabs
              defaultValue="monthly"
              value={billingPeriod}
              onValueChange={(value) => setBillingPeriod(value as "monthly" | "yearly")}
              className="mb-8"
            >
              <div className="mb-8 flex justify-center">
                <TabsList>
                  <TabsTrigger value="monthly">{t("Billing.monthly_billing")}</TabsTrigger>
                  <TabsTrigger value="yearly">
                    {t("Billing.yearly_billing", {
                      discount: "20%",
                      fallback: "Yearly Billing (Save 20%)",
                    })}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="monthly" className="mt-0">
                <div id="monthlyPlans">
                  <SubscriptionSelection />
                </div>
              </TabsContent>

              <TabsContent value="yearly" className="mt-0">
                <div id="yearlyPlans">
                  <Skeleton className="h-32 w-full" />
                  <div className="text-muted-foreground mt-4 text-center">
                    {t("Billing.yearly_plans_coming_soon")}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Enterprise Info */}
        <div className="bg-muted/30 flex items-start gap-3 rounded-lg p-6">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
          <div>
            <h3 className="font-medium">{t("Billing.need_custom_solution")}</h3>
            <p className="text-muted-foreground">{t("Billing.contact_sales_description")}</p>
            <Button
              variant="link"
              className="h-auto px-0"
              onClick={() => {
                const subject = encodeURIComponent("Enterprise Plan Inquiry");
                const body = encodeURIComponent(
                  `Hello,\n\nI'm interested in learning more about enterprise solutions.`,
                );
                window.location.href = `mailto:tanad@sikka.io?subject=${subject}&body=${body}&from=${user.email}`;
              }}
            >
              {t("Billing.contact_sales")}
            </Button>
          </div>
        </div>

        {/* Hidden buttons for subscription management */}
        <div className="hidden">
          <div id="cancelSubscriptionBtn">
            <CurrentPlan />
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
