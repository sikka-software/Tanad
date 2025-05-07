import { ReceiptText, Undo2 } from "lucide-react";
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
import { ConfirmCancelSubscriptionDialog } from "./ConfirmCancelSubscription";

// Create a pub/sub event for subscription updates
export const SUBSCRIPTION_UPDATED_EVENT = "subscription_updated";

interface CurrentPlanProps {
  isPageLoading?: boolean;
}

export default function CurrentPlan({ isPageLoading }: CurrentPlanProps) {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const subscription = useSubscription();
  const { user, profile, fetchUserAndProfile } = useUserStore();
  const { getPlans } = usePricing(TANAD_PRODUCT_ID);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

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
      }, 200);
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

  // Add handler for cancel subscription
  const handleCancelSubscription = async () => {
    if (!subscription.id) {
      toast.error(
        t("Billing.no_active_subscription", { fallback: "No active subscription to cancel" }),
      );
      return;
    }

    setIsCanceling(true);
    try {
      const response = await subscription.cancelSubscription();

      if (response.success) {
        toast.success(
          t("Billing.cancel_subscription.cancel_success", {
            fallback:
              "Your subscription has been canceled and will end at the end of your billing period",
          }),
        );

        // Refresh data to update UI
        await refreshData();

        // Close the dialog
        setIsCancelDialogOpen(false);
      } else {
        toast.error(
          response.error ||
            t("Billing.error_canceling_subscription", {
              fallback: "Error canceling subscription",
            }),
        );
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error(
        t("Billing.error_canceling_subscription", {
          fallback: "Error canceling subscription",
        }),
      );
    } finally {
      setIsCanceling(false);
    }
  };

  // Use the isPageLoading prop to determine loading state
  // If isPageLoading is provided, use it; otherwise fall back to subscription.loading
  const isLoading = isPageLoading !== undefined ? isPageLoading : subscription.loading || !user;

  if (isLoading) {
    return <Skeleton className="h-[180px] w-full flex-1 rounded-lg" />;
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
      <div className="bg-background relative flex-1 rounded-lg border p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {t("Billing.current_plan.title", { fallback: "الباقة الحالية" })}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-lg font-medium">
                  {subscription.planLookupKey
                    ? t(`Billing.${subscription.planLookupKey}`, {
                        fallback: `Billing.${subscription.planLookupKey}`,
                      })
                    : t("Billing.tanad_free", { fallback: "الباقة المجانية" })}
                </span>
                {subscription.status === "active" &&
                  !subscription.cancelAt &&
                  subscription.planLookupKey !== "tanad_free" && (
                    <Badge
                      variant="outline"
                      className="border-green-500 bg-green-50 text-green-700"
                    >
                      {t("Billing.subscription_status.active", { fallback: "نشط" })}
                    </Badge>
                  )}
                {subscription.planLookupKey === "tanad_free" && (
                  <Badge variant="outline" className="border-blue-500 bg-blue-50 text-blue-700">
                    {t("Billing.free_plan_badge", { fallback: "مجانية" })}
                  </Badge>
                )}
                {subscription.cancelAt && (
                  <Badge
                    variant="outline"
                    className="border-orange-200 bg-orange-50 text-orange-700"
                  >
                    {t("Billing.canceling", { fallback: "قيد الإلغاء" })}
                  </Badge>
                )}
              </div>

              {/* Price and billing cycle */}
              {subscription.price && subscription.price !== "0 SAR" && (
                <p className="text-foreground mt-2 font-medium">
                  {locale === "ar"
                    ? `${subscription.price.replace("SAR", "ريال سعودي")} ${
                        subscription.billingCycle === "month" ? "شهرياً" : "سنوياً"
                      }`
                    : `${subscription.price} ${
                        subscription.billingCycle === "month" ? "/month" : "/year"
                      }`}
                </p>
              )}
              {/* Next billing date */}
              {nextBillingDate && (
                <p className="text-foreground mt-2 font-medium">
                  {t("Billing.next_billing_date", { fallback: "التاريخ التالي للفوتر" })}:{" "}
                  {nextBillingDate}
                </p>
              )}
            </div>

            {/* Billing history button */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setIsHistoryDialogOpen(true)}
            >
              <ReceiptText className="h-4 w-4" />
              {t("Billing.view_billing_history", { fallback: "سجل الفواتير" })}
            </Button>
          </div>

          {/* Cancel subscription button - only shown for active paid plans */}
          {subscription.status === "active" &&
            subscription.planLookupKey !== "tanad_free" &&
            !subscription.cancelAt && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => setIsCancelDialogOpen(true)}
                >
                  {t("Billing.cancel_subscription.button", { fallback: "إلغاء الاشتراك" })}
                </Button>
              </div>
            )}

          {/* Reactivate subscription button for canceled subscriptions */}
          {subscription.cancelAt && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="text-primary border-primary/30 hover:bg-primary/10 flex items-center gap-1"
                onClick={() => {
                  // Add reactivation logic here if needed
                }}
              >
                <Undo2 className="h-4 w-4" />
                {t("Billing.reactivate_subscription", { fallback: "إعادة تفعيل الاشتراك" })}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Billing History Dialog */}
      <BillingHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        user={user}
      />

      {/* Cancel Subscription Dialog */}
      <ConfirmCancelSubscriptionDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        isCanceling={isCanceling}
        onConfirm={handleCancelSubscription}
      />
    </>
  );
}
