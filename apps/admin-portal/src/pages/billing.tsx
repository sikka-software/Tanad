"use client";

import { Info } from "lucide-react";
import { GetStaticProps } from "next";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import { useSubscription } from "@/hooks/use-subscription";

import CurrentPlan, { SUBSCRIPTION_UPDATED_EVENT } from "@/components/billing/CurrentPlan";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import useUserStore from "@/stores/use-user-store";

export default function Billing() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const { user, fetchUserAndProfile } = useUserStore();
  const subscription = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const initialized = useRef(false);
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);

  // Force refresh when refresh query parameter is present
  useEffect(() => {
    if (router.query.refresh && user) {
      console.log("Billing page: Force refresh due to query parameter");
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
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        // Reset loading state after a reasonable delay
        setTimeout(() => {
          setIsUpdatingSubscription(false);
        }, 1000);
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
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        // If still mounted, reset loading state
        if (mounted) {
          setTimeout(() => {
            setIsUpdatingSubscription(false);
          }, 1000);
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
      }, 5000);
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

  // Show subscription management for active subscriptions (including canceled ones)
  const showSubscriptionManagement =
    subscription.status === "active" && subscription.name !== t("Billing.free_plan");

  // Improved condition to determine what counts as a free plan
  const isFreePlan =
    !subscription.planLookupKey ||
    subscription.planLookupKey === "tanad_free" ||
    subscription.price === "0" ||
    subscription.price === "0 SAR" ||
    !subscription.price;

  // If we know the user has a paid subscription, don't show selection
  const hasActivePaidSubscription =
    subscription.status === "active" &&
    subscription.planLookupKey &&
    subscription.planLookupKey !== "tanad_free" &&
    !subscription.cancelAt;

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
  console.log("hasActivePaidSubscription", hasActivePaidSubscription);
  console.log("showSubscriptionSelection :", showSubscriptionSelection);
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
