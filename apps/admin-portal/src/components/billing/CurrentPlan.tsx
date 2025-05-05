import { RefreshCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { usePricing } from "@/hooks/use-pricing";
import { useSubscription } from "@/hooks/use-subscription";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { TANAD_PRODUCT_ID } from "@/lib/constants";

import useUserStore from "@/stores/use-user-store";

import { BillingHistoryDialog } from "./BillingHistoryDialog";

// Create a pub/sub event for subscription updates
export const SUBSCRIPTION_UPDATED_EVENT = "subscription_updated";

export default function CurrentPlan() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const subscription = useSubscription();
  const { user, profile, fetchUserAndProfile } = useUserStore();
  const { getPlans } = usePricing(TANAD_PRODUCT_ID);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log("CurrentPlan rendering with:", {
    user: user?.id,
    profile: profile
      ? {
          id: profile.id,
          subscribed_to: profile.subscribed_to,
          price_id: profile.price_id,
          stripe_customer_id: profile.stripe_customer_id,
        }
      : null,
    subscription: {
      loading: subscription.loading,
      plan: subscription.planLookupKey,
      status: subscription.status,
    },
  });

  // Add a function to handle forced refresh with router
  const forcePageRefresh = () => {
    console.log("CurrentPlan: Forcing page refresh via router");
    router.push({
      pathname: router.pathname,
      query: { ...router.query, refresh: Date.now() },
    });
  };

  // Memoize the refresh function to prevent unnecessary re-renders
  const refreshData = useCallback(async () => {
    if (!user) return;

    // Set refreshing state to show loading indicators
    setIsRefreshing(true);

    // Refresh both subscription data and user data
    try {
      console.log("Manually refreshing subscription and user data");
      await fetchUserAndProfile();
      await subscription.refetch();
      setLastRefreshTime(Date.now()); // Update refresh timestamp
      console.log("Data refresh complete");
    } catch (error) {
      console.error("Error refreshing data:", error);

      // If refresh fails, try forcing a page refresh as last resort
      setTimeout(() => {
        if (error) {
          forcePageRefresh();
        }
      }, 2000);
    } finally {
      // Allow some minimum time for the refreshing state to be visible
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  }, [user, fetchUserAndProfile, subscription, router]);

  // Listen for subscription update events
  useEffect(() => {
    const handleSubscriptionUpdated = () => {
      console.log("Subscription updated event received, refreshing data");
      refreshData();
    };

    // Use both event types for better compatibility
    window.addEventListener(SUBSCRIPTION_UPDATED_EVENT, handleSubscriptionUpdated);
    window.addEventListener("subscription_updated", handleSubscriptionUpdated);

    return () => {
      window.removeEventListener(SUBSCRIPTION_UPDATED_EVENT, handleSubscriptionUpdated);
      window.removeEventListener("subscription_updated", handleSubscriptionUpdated);
    };
  }, [refreshData]);

  // Use a ref to track initial refresh
  const refreshedInitially = React.useRef(false);

  // Initial refresh when component mounts
  useEffect(() => {
    if (!refreshedInitially.current && user) {
      refreshedInitially.current = true;
      refreshData();
    }
  }, [user, refreshData]);

  if (subscription.loading || !user || isRefreshing) {
    return <Skeleton className="h-24 w-full rounded-lg" />;
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
      } else if (typeof subscription.nextBillingDate === "number") {
        // Handle Unix timestamp (seconds)
        date = new Date(subscription.nextBillingDate * 1000);
      } else {
        // Try to parse as regular date
        date = new Date(subscription.nextBillingDate);
      }

      if (isNaN(date.getTime())) return subscription.nextBillingDate;

      // Format the date based on locale
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      try {
        return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", options);
      } catch (e) {
        // Fallback for browsers that don't support the locale
        return date.toLocaleDateString("en-US", options);
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return subscription.nextBillingDate;
    }
  };

  const nextBillingDate = formatNextBillingDate();

  return (
    <>
      <div className="bg-background rounded-lg border p-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold">{t("Billing.current_plan.title")}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-medium">
                {subscription.planLookupKey
                  ? t(`Billing.${subscription.planLookupKey}`, {
                      fallback: subscription.planLookupKey,
                    })
                  : t("Billing.tanad_free", { fallback: "Free Plan" })}
              </span>
              {subscription.status === "active" &&
                !subscription.cancelAt &&
                subscription.planLookupKey !== "tanad_free" && (
                  <Badge variant="outline" className="border-green-500 bg-green-50 text-green-700">
                    {t("Billing.subscription_status.active")}
                  </Badge>
                )}
              {subscription.planLookupKey === "tanad_free" && (
                <Badge variant="outline" className="border-blue-500 bg-blue-50 text-blue-700">
                  {t("Billing.free_plan_badge", { fallback: "Free" })}
                </Badge>
              )}
              {subscription.status === "trialing" && (
                <Badge variant="outline" className="border-blue-500 bg-blue-50 text-blue-700">
                  {t("Billing.subscription_status.trialing")}
                </Badge>
              )}
              {subscription.cancelAt && (
                <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                  {t("Billing.canceling")}
                </Badge>
              )}
            </div>

            {/* Price and billing cycle */}
            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4">
              {subscription.price && subscription.price !== "0 SAR" && (
                <p className="text-foreground font-medium">
                  {locale === "ar"
                    ? subscription.price.replace("SAR", "ريال سعودي")
                    : subscription.price}
                  {subscription.billingCycle && subscription.billingCycle !== "-" && (
                    <span className="text-muted-foreground">
                      {" "}
                      {locale === "ar"
                        ? subscription.billingCycle === "month"
                          ? "شهرياً"
                          : "سنوياً"
                        : subscription.billingCycle === "month"
                          ? "/month"
                          : "/year"}
                    </span>
                  )}
                </p>
              )}

              {/* Billing cycle badge */}
              {subscription.billingCycle && subscription.billingCycle !== "-" && (
                <Badge variant="outline" className="text-xs">
                  {t(`Billing.${subscription.billingCycle}_billing`, {
                    fallback:
                      subscription.billingCycle === "month" ? "Monthly billing" : "Annual billing",
                  })}
                </Badge>
              )}
            </div>

            {/* Format cancellation date if available */}
            {subscription.cancelAt && (
              <p className="mt-2 flex items-center text-sm text-orange-600">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-orange-500"></span>
                {t("Billing.subscription_cancels_on", {
                  date: new Date(Number(subscription.cancelAt) * 1000).toLocaleDateString(
                    locale === "ar" ? "ar-SA" : "en-US",
                    { year: "numeric", month: "long", day: "numeric" },
                  ),
                  fallback: `Your subscription will cancel on ${new Date(
                    Number(subscription.cancelAt) * 1000,
                  ).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`,
                })}
              </p>
            )}

            {/* Next billing date */}
            {nextBillingDate && !subscription.cancelAt && (
              <p className="text-muted-foreground mt-2 flex items-center">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500"></span>
                {locale === "ar"
                  ? t("Billing.next_billing_date_is", {
                      date: nextBillingDate,
                      fallback: `تاريخ الفاتورة القادمة هو ${nextBillingDate}`,
                    })
                  : t("Billing.next_billing_date_is", {
                      date: nextBillingDate,
                      fallback: `Your subscription will automatically renew on ${nextBillingDate}`,
                    })}
              </p>
            )}
          </div>
          <div>
            <Button
              variant="outline"
              className="bg-background hover:bg-accent"
              onClick={async () => {
                // Open the dialog without forcing a refresh
                setIsHistoryDialogOpen(true);
              }}
            >
              {t("Billing.history", { fallback: "Billing History" })}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                refreshData();
                toast.success(t("Billing.data_refreshed", { fallback: "Billing data refreshed" }));
              }}
              className="ml-2 h-9 w-9"
              title={t("Billing.current_plan.refresh", { fallback: "Refresh" })}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Use the separate billing history dialog component */}
      <BillingHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        user={user}
      />
    </>
  );
}
