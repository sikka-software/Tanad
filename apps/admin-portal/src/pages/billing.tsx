"use client";

// Components
import { pick } from "lodash";
import { Info } from "lucide-react";
import { GetServerSideProps } from "next";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import { useSubscription } from "@/hooks/use-subscription";
import { useUsage } from "@/hooks/use-usage";

import CurrentPlan from "@/components/billing/CurrentPlan";
import SubscriptionSelection from "@/components/billing/SubscriptionSelection";
import UsageStats from "@/components/billing/UsageStats";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import useUserStore from "@/stores/use-user-store";

export default function Billing() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const { user, fetchUserAndProfile, profile } = useUserStore();
  const subscription = useSubscription();
  const { usageData, refresh: refreshUsage } = useUsage();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const initialLoadComplete = useRef(false);

  // Pre-load all data before rendering any components
  useEffect(() => {
    if (!initialLoadComplete.current && user) {
      // Mark as loading
      setIsRefreshing(true);

      // Load all data simultaneously
      Promise.all([subscription.refetch(), fetchUserAndProfile(), refreshUsage()])
        .then(() => {
          // Set initialLoadComplete to prevent future initial loads
          initialLoadComplete.current = true;
          // Allow rendering
          setShouldRender(true);
        })
        .catch((err) => {
          console.error("Error during initial data load:", err);
          // Still allow rendering even on error
          setShouldRender(true);
        })
        .finally(() => {
          setIsRefreshing(false);
        });
    } else if (user && !shouldRender) {
      // If we already have user but render flag not set (e.g. on navigation)
      setShouldRender(true);
    }
  }, [user, subscription, fetchUserAndProfile, refreshUsage]);

  // Force refresh when refresh query parameter is present
  useEffect(() => {
    if (router.query.refresh && user) {
      setIsRefreshing(true);
      setShouldRender(false);

      // Remove the refresh query parameter without page reload
      const { refresh, ...restQuery } = router.query;
      router.replace(
        {
          pathname: router.pathname,
          query: restQuery,
        },
        undefined,
        { shallow: true },
      );

      // Force a full data refresh
      Promise.all([subscription.refetch(), fetchUserAndProfile(), refreshUsage()])
        .then(() => {
          setShouldRender(true);
        })
        .catch((err) => {
          console.error("Data refresh failed:", err);
          setShouldRender(true);
        })
        .finally(() => {
          setIsRefreshing(false);
        });
    }
  }, [router.query.refresh, user, fetchUserAndProfile, subscription, refreshUsage, router]);

  // Listen for subscription update events
  useEffect(() => {
    const handleSubscriptionUpdated = () => {
      setIsRefreshing(true);
      setShouldRender(false);

      Promise.all([subscription.refetch(), fetchUserAndProfile(), refreshUsage()])
        .then(() => {
          setShouldRender(true);
        })
        .catch((err) => {
          console.error("Data refresh failed:", err);
          setShouldRender(true);
        })
        .finally(() => {
          setIsRefreshing(false);
        });
    };

    window.addEventListener("subscription_updated", handleSubscriptionUpdated);

    return () => {
      window.removeEventListener("subscription_updated", handleSubscriptionUpdated);
    };
  }, [subscription, fetchUserAndProfile, refreshUsage]);

  // Determine if the user has a free plan
  const isFreePlan =
    !subscription.planLookupKey ||
    subscription.planLookupKey === "tanad_free" ||
    subscription.price === "0" ||
    subscription.price === "0 SAR";

  // Determine if we should show subscription selection
  const showSubscriptionSelection =
    !subscription.loading &&
    !isRefreshing &&
    (subscription.status !== "active" || (subscription.status === "active" && isFreePlan));

  const handleSubscriptionUpdate = async () => {
    setIsRefreshing(true);
    setShouldRender(false);

    try {
      await Promise.all([subscription.refetch(), fetchUserAndProfile(), refreshUsage()]);
    } catch (error) {
      console.error("Error updating subscription data:", error);
    } finally {
      setShouldRender(true);
      setIsRefreshing(false);
    }
  };

  // Calculate the page loading state
  const isPageLoading = isRefreshing || !user || !shouldRender;

  // Check if we should show upgrade options
  const canUpgrade = profile?.subscribed_to === "tanad_free";

  // Return a skeleton version of the page layout for loading state
  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-2">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <div className="mb-10">
          <div className="flex flex-col gap-4 md:flex-row">
            <Skeleton className="h-[180px] w-full flex-1 rounded-lg" />
            <Skeleton className="h-[180px] w-full flex-1 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <CustomPageMeta title={t("Billing.title")} description={t("Billing.description")} />
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

        {/* Current Plan and Usage Stats - both components share the same loading state */}
        <div className="mb-10">
          {isRefreshing || !shouldRender ? (
            <div className="flex flex-col gap-4 md:flex-row">
              <Skeleton className="h-[180px] w-full flex-1 rounded-lg" />
              <Skeleton className="h-[180px] w-full flex-1 rounded-lg" />
            </div>
          ) : (
            <div className="flex flex-col gap-4 md:flex-row">
              <CurrentPlan />
              <UsageStats
                {...usageData}
                employeeUsage={usageData.employeeUsage}
                storageUsage={usageData.storageUsage}
                invoiceUsage={usageData.invoiceUsage}
                clientsUsage={usageData.clientsUsage}
              />
            </div>
          )}
        </div>

        {/* Subscription Selection Section - show only for free users */}
        {showSubscriptionSelection && (
          <div className="w-full" id="plans">
            {isRefreshing || !shouldRender ? (
              <>
                <div className="mb-6">
                  <Skeleton className="mb-2 h-8 w-1/3" />
                  <Skeleton className="h-5 w-2/3" />
                </div>
                <div className="mb-8 flex justify-center">
                  <Skeleton className="h-10 w-64 rounded-full" />
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <Skeleton className="h-[400px] rounded-lg" />
                  <Skeleton className="h-[400px] rounded-lg" />
                  <Skeleton className="h-[400px] rounded-lg" />
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
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
