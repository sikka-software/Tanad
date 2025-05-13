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
import { ConfirmReactivateSubscriptionDialog } from "./ConfirmReactivateSubscription";

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
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  // Add a function to handle forced refresh with router
  const forcePageRefresh = () => {
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
      await fetchUserAndProfile();
      await subscription.refetch();
      setLastRefreshTime(Date.now()); // Update refresh timestamp
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

  // One-time check to detect if a subscription has expired but UI hasn't updated
  useEffect(() => {
    // Skip if already checked or no user
    if (!user) return;

    // Get current date
    const now = new Date();

    // Also check against the cancel_at date if it exists
    if (subscription.cancelAt) {
      // Convert the cancelAt to a Date object
      const cancelAtDate = new Date(subscription.cancelAt * 1000);

      // If current date is past the cancelAt date, force refresh
      if (now > cancelAtDate) {
        // Force immediate refresh including API calls
        refreshData().then(() => {
          // If subscription still shows as canceling, force a full page reload
          if (subscription.status === "canceling" || subscription.status === "active") {
            setTimeout(() => {
              console.log("Cancel date has passed, forcing page refresh to update status");
              window.location.href = window.location.href.split("?")[0] + "?refresh=" + Date.now();
            }, 1000);
          }
        });
      } else {
        // If not expired yet, but will expire soon (within 2 days), set a timer to refresh
        const msUntilExpiration = cancelAtDate.getTime() - now.getTime();
        const daysUntilExpiration = msUntilExpiration / (1000 * 60 * 60 * 24);

        if (daysUntilExpiration < 2) {
          const timeoutMs = Math.min(msUntilExpiration, 1000 * 60 * 60); // Max 1 hour
          console.log(
            `Subscription will cancel soon (${daysUntilExpiration.toFixed(1)} days). Setting refresh timer for ${(timeoutMs / 1000 / 60).toFixed(1)} minutes.`,
          );
          setTimeout(() => {
            refreshData();
          }, timeoutMs);
        }
      }
    }
  }, [user, subscription.cancelAt, subscription.status, refreshData]);

  // Add handler for cancel subscription
  const handleCancelSubscription = async (cancelAtPeriodEnd: boolean = true) => {
    if (!subscription.id) {
      toast.error(
        t("Billing.no_active_subscription", { fallback: "No active subscription to cancel" }),
      );
      return;
    }

    setIsCanceling(true);
    try {
      const response = await subscription.cancelSubscription(cancelAtPeriodEnd);

      if (response.success) {
        toast.success(
          cancelAtPeriodEnd
            ? t("Billing.cancel_subscription.cancel_success", {
                fallback:
                  "Your subscription has been canceled and will end at the end of your billing period",
              })
            : t("Billing.cancel_subscription.immediate_cancel_success", {
                fallback: "Your subscription has been canceled immediately",
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

  // Add handler for reactivating subscription
  const handleReactivateSubscription = async () => {
    if (!subscription.id || !subscription.cancelAt) {
      toast.error(
        t("Billing.no_subscription_to_reactivate", {
          fallback: "No subscription available to reactivate",
        }),
      );
      return;
    }

    setIsReactivating(true);
    try {
      const response = await subscription.reactivateSubscription();

      if (response.success) {
        toast.success(
          t("Billing.reactivate_subscription.success", {
            fallback: "Your subscription has been reactivated successfully",
          }),
        );

        // Refresh data to update UI
        await refreshData();

        // Dispatch a custom event to notify other components about usage stats changes
        const usageUpdatedEvent = new CustomEvent("usage_stats_updated");
        window.dispatchEvent(usageUpdatedEvent);

        // Close the dialog
        setIsReactivateDialogOpen(false);
      } else {
        toast.error(
          response.error ||
            t("Billing.error_reactivating_subscription", {
              fallback: "Error reactivating subscription",
            }),
        );
      }
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      toast.error(
        t("Billing.error_reactivating_subscription", {
          fallback: "Error reactivating subscription",
        }),
      );
    } finally {
      setIsReactivating(false);
    }
  };

  // Use the isPageLoading prop to determine loading state
  // If isPageLoading is provided, use it; otherwise fall back to subscription.loading
  const isLoading = isPageLoading !== undefined ? isPageLoading : subscription.loading || !user;

  if (isLoading) {
    return <Skeleton className="h-[180px] w-full flex-1 rounded-md" />;
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

  // Get plan name for display
  const planName = subscription.planLookupKey
    ? t(`Billing.${subscription.planLookupKey}`, {
        fallback: subscription.name || "Subscription Plan",
      })
    : t("Billing.tanad_free", { fallback: "Free Plan" });

  // Add a function to format the cancellation date
  const formatCancelAtDate = (cancelAt: string | number | null) => {
    if (!cancelAt) return null;

    try {
      let date;
      if (typeof cancelAt === "string") {
        date = new Date(cancelAt);
      } else {
        date = new Date(cancelAt * 1000);
      }

      if (isNaN(date.getTime())) {
        return null;
      }

      // Format the date based on locale
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", options);
    } catch (error) {
      console.error("Error formatting cancellation date:", error);
      return null;
    }
  };

  // Calculate days remaining until cancellation
  const getDaysRemaining = (cancelAt: string | number | null) => {
    if (!cancelAt) return null;

    try {
      let cancelDate;
      if (typeof cancelAt === "string") {
        cancelDate = new Date(cancelAt);
      } else {
        cancelDate = new Date(cancelAt * 1000);
      }

      if (isNaN(cancelDate.getTime())) {
        return null;
      }

      const today = new Date();
      const diffTime = Math.abs(cancelDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    } catch (error) {
      console.error("Error calculating days remaining:", error);
      return null;
    }
  };

  console.log("subscription", subscription);

  return (
    <>
      <div className="bg-background relative flex-1 rounded-md border p-6">
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
                {subscription.status === "canceling" && (
                  <Badge
                    variant="outline"
                    className="border-orange-200 bg-orange-50 text-orange-700"
                  >
                    {t("Billing.subscription_status.canceling", { fallback: "قيد الإلغاء" })}
                  </Badge>
                )}
                {subscription.status === "canceled" && (
                  <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                    {t("Billing.subscription_status.canceled", { fallback: "ملغي" })}
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

              {/* Next billing date and cycle - enhanced section */}
              {subscription.status === "active" &&
                !subscription.cancelAt &&
                subscription.planLookupKey !== "tanad_free" && (
                  <div className="bg-primary/5 border-primary/10 mt-3 rounded-md border p-3">
                    <p className="text-foreground text-sm font-semibold">
                      {t("Billing.next_billing.title", { fallback: "Next Billing Information" })}:
                    </p>
                    <div className="mt-1 flex flex-col gap-1 text-sm">
                      {nextBillingDate && (
                        <p className="text-foreground">
                          <span className="font-medium">
                            {t("Billing.next_billing_date", { fallback: "Next Payment Date" })}:
                          </span>{" "}
                          {nextBillingDate}
                        </p>
                      )}
                      <p className="text-foreground">
                        <span className="font-medium">
                          {t("Billing.billing_cycle", { fallback: "Billing Cycle" })}:
                        </span>{" "}
                        {locale === "ar"
                          ? subscription.billingCycle === "month"
                            ? "شهري"
                            : "سنوي"
                          : subscription.billingCycle === "month"
                            ? "Monthly"
                            : "Yearly"}
                      </p>
                      <p className="text-foreground">
                        <span className="font-medium">
                          {t("Billing.amount", { fallback: "Amount" })}:
                        </span>{" "}
                        {locale === "ar"
                          ? subscription?.price?.replace("SAR", "ريال سعودي")
                          : subscription?.price}
                      </p>
                    </div>
                  </div>
                )}

              {/* For canceled subscriptions - show when service will end */}
              {subscription.cancelAt && (
                <div className="mt-3 rounded-md border border-orange-200 bg-orange-50/80 p-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 rounded-full bg-orange-100 p-1.5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-orange-600"
                      >
                        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
                        <path d="M12 7v5l2 2"></path>
                      </svg>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-orange-700">
                        {t("Billing.service_end.title", { fallback: "نهاية الخدمة:" })}
                      </p>

                      <div className="mt-1.5">
                        <div className="flex flex-col gap-1 text-sm text-orange-700">
                          <p className="flex items-center gap-1">
                            <span className="font-medium">
                              {t("Billing.service_end.date", { fallback: "تاريخ الإنتهاء:" })}
                            </span>{" "}
                            <span className="font-semibold">
                              {formatCancelAtDate(subscription.cancelAt) ||
                                nextBillingDate ||
                                "N/A"}
                            </span>
                          </p>

                          {getDaysRemaining(subscription.cancelAt) && (
                            <p className="flex items-center gap-1">
                              <span className="font-medium">
                                {t("Billing.service_end.days_remaining", {
                                  fallback: "الأيام المتبقية:",
                                })}
                              </span>{" "}
                              <span className="font-semibold">
                                {locale === "ar"
                                  ? `${getDaysRemaining(subscription.cancelAt)} يوم`
                                  : `${getDaysRemaining(subscription.cancelAt)} days`}
                              </span>
                            </p>
                          )}

                          <p className="mt-1.5 text-orange-600">
                            {subscription.status === "canceled"
                              ? t("Billing.service_end.message_already_canceled", {
                                  fallback:
                                    "تم إلغاء الاشتراك، وسيتم تحويل الحساب إلى الباقة المجانية في التاريخ المحدد.",
                                })
                              : subscription.status === "canceling"
                                ? t("Billing.service_end.message_canceling", {
                                    fallback:
                                      "تم إلغاء الاشتراك، وستظل جميع الميزات متاحة حتى نهاية الفترة، ثم سيتم تحويل الحساب إلى الباقة المجانية.",
                                  })
                                : t("Billing.service_end.message", {
                                    fallback:
                                      "ستظل جميع الميزات متاحة حتى نهاية الفترة، ثم سيتم تحويل الحساب إلى الباقة المجانية.",
                                  })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
          {(subscription.cancelAt || subscription.status === "canceled") && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="text-primary border-primary/30 hover:bg-primary/10 flex items-center gap-1"
                onClick={() => setIsReactivateDialogOpen(true)}
              >
                <Undo2 className="h-4 w-4" />
                {t("Billing.reactivate_subscription.title", { fallback: "إعادة تفعيل الاشتراك" })}
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
        dir={locale === "ar" ? "rtl" : "ltr"}
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        isCanceling={isCanceling}
        onConfirm={handleCancelSubscription}
      />

      {/* Reactivate Subscription Dialog */}
      <ConfirmReactivateSubscriptionDialog
        dir={locale === "ar" ? "rtl" : "ltr"}
        open={isReactivateDialogOpen}
        onOpenChange={setIsReactivateDialogOpen}
        isReactivating={isReactivating}
        onConfirm={handleReactivateSubscription}
        planName={planName}
      />
    </>
  );
}
