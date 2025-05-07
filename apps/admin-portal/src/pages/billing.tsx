"use client";

import { Info } from "lucide-react";
import { GetStaticProps } from "next";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import { useSubscription } from "@/hooks/use-subscription";

import CurrentPlan, { SUBSCRIPTION_UPDATED_EVENT } from "@/components/billing/CurrentPlan";
import SubscriptionSelection from "@/components/billing/SubscriptionSelection";
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
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const initialized = useRef(false);
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);

  // Force refresh when refresh query parameter is present
  useEffect(() => {
    if (router.query.refresh && user) {
      setIsUpdatingSubscription(true);

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

      // Force a full data refresh with multiple retries
      const refreshData = async () => {
        console.log("Billing page: Forcing data refresh from query parameter");
        for (let i = 0; i < 3; i++) {
          try {
            await subscription.refetch();
            await fetchUserAndProfile();
            console.log(`Query-triggered data refresh attempt ${i + 1} completed`);
            break;
          } catch (err) {
            console.error(`Query-triggered data refresh attempt ${i + 1} failed:`, err);
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        // Reset loading state after a shorter delay
        setTimeout(() => {
          setIsUpdatingSubscription(false);
        }, 300);
      };

      refreshData();
    }
  }, [router.query.refresh, user, fetchUserAndProfile, subscription, router]);

  // Cleanup subscription on unmount
  useEffect(() => {
    // Keep track of component mount status
    let mounted = true;

    // Set initialization flag only once
    if (!initialized.current) {
      initialized.current = true;
      console.log("Billing page: Initial mount");
    }

    // Listen for subscription update events
    const handleSubscriptionUpdated = () => {
      console.log("Billing page: Subscription update detected");
      setIsUpdatingSubscription(true);

      // Force a full data refresh with multiple retries
      const refreshData = async () => {
        console.log("Billing page: Forcing full data refresh");
        for (let i = 0; i < 3; i++) {
          try {
            await subscription.refetch();
            await fetchUserAndProfile();
            console.log(`Data refresh attempt ${i + 1} completed`);
            break;
          } catch (err) {
            console.error(`Data refresh attempt ${i + 1} failed:`, err);
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        // If still mounted, reset loading state
        if (mounted) {
          setTimeout(() => {
            setIsUpdatingSubscription(false);
          }, 300);
        }
      };

      refreshData();

      // Last resort - force reload after a delay if UI still doesn't update
      setTimeout(() => {
        if (
          mounted &&
          (subscription.planLookupKey === "tanad_free" || !subscription.planLookupKey)
        ) {
          console.log("Forcing page reload to refresh subscription data");
          // Use router.push with refresh parameter instead of window.location.reload
          router.push({
            pathname: router.pathname,
            query: { refresh: Date.now() },
          });
        }
      }, 3000);
    };

    window.addEventListener(SUBSCRIPTION_UPDATED_EVENT, handleSubscriptionUpdated);
    window.addEventListener("subscription_updated", handleSubscriptionUpdated);

    // Return cleanup function
    return () => {
      mounted = false;
      // Clear any refresh timers or flags
      window.lastSubscriptionRefresh = undefined;
      // Remove event listeners
      window.removeEventListener(SUBSCRIPTION_UPDATED_EVENT, handleSubscriptionUpdated);
      window.removeEventListener("subscription_updated", handleSubscriptionUpdated);
    };
  }, [subscription, fetchUserAndProfile, router]);

  // Improved condition to determine what counts as a free plan
  const isFreePlan =
    !subscription.planLookupKey ||
    subscription.planLookupKey === "tanad_free" ||
    subscription.price === "0" ||
    subscription.price === "0 SAR" ||
    !subscription.price;

  // If we know the user has a paid subscription, don't show selection
  const hasActivePaidSubscription =
    // Check subscription status from the subscription hook
    (subscription.status === "active" &&
      subscription.planLookupKey &&
      subscription.planLookupKey !== "tanad_free" &&
      !subscription.cancelAt) ||
    // As a fallback, also check the profile data directly
    (profile?.subscribed_to &&
      profile.subscribed_to !== "tanad_free" &&
      profile.subscribed_to !== null);

  // Show subscription selection for new/free/expired users
  const showSubscriptionSelection =
    !subscription.loading &&
    !isUpdatingSubscription &&
    !hasActivePaidSubscription && // Check if user has an active paid subscription
    (!subscription.status || // No subscription
      subscription.status === "canceled" || // Canceled subscription
      subscription.status === "incomplete_expired" || // Failed subscription
      subscription.status === "unpaid" || // Unpaid subscription
      (subscription.status === "active" && isFreePlan) || // Free plan
      (subscription.cancelAt && new Date(Number(subscription.cancelAt) * 1000) < new Date())); // Expired subscription

  if (!user) {
    return <Skeleton className="h-[300px] w-full" />;
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

        {/* Current Plan Card */}
        <div className="mb-10">
          {isUpdatingSubscription ? (
            <Skeleton className="h-24 w-full rounded-lg" />
          ) : (
            <CurrentPlan />
          )}
        </div>

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

        {/* Show loading skeleton when updating subscription */}
        {isUpdatingSubscription && !showSubscriptionSelection && (
          <div className="mb-8 w-full">
            <Skeleton className="h-[400px] w-full" />
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
