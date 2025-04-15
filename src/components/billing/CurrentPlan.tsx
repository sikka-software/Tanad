import { useState } from "react";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

import { AlertTriangle, Calendar, CalendarOff } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useUserStore from "@/hooks/use-user-store";

import { Button } from "../ui/button";
import ConfirmCancelSubscription from "./ConfirmCancelSubscription";
import { ConfirmReactivateSubscription } from "./ConfirmReactivateSubscription";

interface CurrentPlanProps {
  id?: string | null;
  name?: string | null;
  price?: number | string | null;
  billingCycle?: string | null;
  nextBillingDate?: string | null;
  cancelAt?: string | null;
  status?:
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "trialing"
    | "unpaid"
    | "paused"
    | null;
  isExpired?: boolean;
  isLoading?: boolean;
  refetch?: () => Promise<void>;
  onSubscriptionUpdate?: () => Promise<void>;
  disabled?: boolean;
}

// Helper function to format price for Arabic locale
function formatPriceForLocale(price: string | number | null | undefined, locale: string): string {
  if (!price) return "-";

  // Convert price to string if it's a number
  const priceStr = typeof price === "number" ? price.toString() : price;

  if (locale !== "ar") {
    // For non-Arabic locales, just ensure it's formatted nicely
    const numericMatch = priceStr.match(/(\d+(\.\d+)?)/);
    if (numericMatch) {
      const number = parseFloat(numericMatch[0]);
      const formatted = number.toLocaleString("en-US");
      return priceStr.replace(numericMatch[0], formatted);
    }
    return priceStr;
  }

  // For Arabic, use full Arabic formatting
  const parts = priceStr.toString().split(" ");
  if (parts.length >= 2) {
    let amount = parts[0];
    const currency = parts[1];

    // Try to parse the amount as a number for proper formatting
    try {
      const numAmount = parseFloat(amount);
      amount = new Intl.NumberFormat("ar-SA", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(numAmount);
    } catch (e) {
      // If parsing fails, keep original amount
    }

    // Replace SAR with ر.س for Arabic
    const arabicCurrency = currency === "SAR" ? "ر.س" : currency;

    // Format with appropriate spacing for Arabic
    let result = `${amount} ${arabicCurrency}`;

    // Add interval information if present
    if (parts.length > 2 && parts[2].startsWith("/")) {
      const interval = parts[2].substring(1); // remove the slash
      const arabicInterval =
        interval === "month" ? "شهرياً" : interval === "year" ? "سنوياً" : interval;
      result += ` ${arabicInterval}`;
    } else if (parts.length === 2) {
      // Add monthly by default if no interval specified
      result += " شهرياً";
    }

    return result;
  }

  // For simple numeric values, format to Arabic numerals
  if (/^\d+(\.\d+)?$/.test(priceStr)) {
    const num = parseFloat(priceStr);
    return new Intl.NumberFormat("ar-SA").format(num);
  }

  return priceStr;
}

export default function CurrentPlan({
  id,
  name,
  price,
  billingCycle,
  nextBillingDate,
  cancelAt,
  status,
  isExpired,
  isLoading = false,
  refetch,
  onSubscriptionUpdate,
  disabled = false,
}: CurrentPlanProps) {
  const t = useTranslations();
  const [isCanceling, setIsCanceling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const locale = useLocale();
  const { user } = useUserStore();
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);

  // Helper function to get current plan details based on subscription state
  const getCurrentPlanDetails = () => {
    if (isExpired || status === "canceled" || status === "incomplete_expired") {
      return {
        name: "billing.free_plan",
        price: "0",
        billingCycle: "month",
        nextBillingDate: "-",
      };
    }
    return {
      name,
      price,
      billingCycle,
      nextBillingDate,
    };
  };

  const currentPlan = getCurrentPlanDetails();
  const handleCancelSubscription = async () => {
    if (!id) return;

    try {
      setIsCanceling(true);
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      toast.success(t("billing.cancel_subscription.cancel_success"));

      // Refresh the subscription data
      if (refetch) {
        await refetch();
      }

      // Call onSubscriptionUpdate if provided
      if (onSubscriptionUpdate) {
        await onSubscriptionUpdate();
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error(error instanceof Error ? error.message : t("billing.cancel_error"));
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReactivateSubscription = () => {
    setIsReactivateDialogOpen(true);
  };

  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <Badge variant="destructive" className="gap-1 text-nowrap">
          <AlertTriangle className="h-3 w-3" />
          {t("billing.subscription_expired")}
        </Badge>
      );
    }
    if (cancelAt) {
      // Convert Unix timestamp to Date object
      const cancelDate = new Date(Number(cancelAt) * 1000);

      // Format the date with proper options
      let formattedDate;
      try {
        formattedDate = cancelDate.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
          year: "numeric" as const,
          month: "long" as const,
          day: "numeric" as const,
        });
      } catch (error) {
        // Fallback formatting if locale isn't supported
        console.error("Date formatting error:", error);
        formattedDate =
          locale === "ar"
            ? `${cancelDate.getDate()}/${cancelDate.getMonth() + 1}/${cancelDate.getFullYear()}`
            : cancelDate.toLocaleDateString("en-US", {
                year: "numeric" as const,
                month: "long" as const,
                day: "numeric" as const,
              });
      }
      return (
        <Badge variant="secondary" className="gap-1 text-nowrap">
          <CalendarOff className="h-3 w-3" />
          {t("billing.subscription_cancels_on")} {formattedDate}
        </Badge>
      );
    }

    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="gap-1">
            <Calendar className="h-3 w-3" />
            {t("billing.subscription_status.active")}
          </Badge>
        );
      case "trialing":
        return <Badge variant="secondary">{t("billing.subscription_trialing")}</Badge>;
      case "past_due":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {t("billing.subscription_past_due")}
          </Badge>
        );
      case "canceled":
        return <Badge variant="destructive">{t("billing.subscription_canceled")}</Badge>;
      case "incomplete":
        return <Badge variant="secondary">{t("billing.subscription_incomplete")}</Badge>;
      case "incomplete_expired":
        return <Badge variant="destructive">{t("billing.subscription_incomplete_expired")}</Badge>;
      case "unpaid":
        return <Badge variant="destructive">{t("billing.subscription_unpaid")}</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Get display name of plan from translation
  const displayPlanName = currentPlan.name
    ? t(`billing.${currentPlan.name}`, { fallback: currentPlan.name })
    : "-";

  // Format price for display based on locale
  const displayPrice = formatPriceForLocale(currentPlan.price, locale);

  // Get header background class based on plan name
  const getPlanHeaderClass = () => {
    const planKey =
      typeof currentPlan.name === "string"
        ? currentPlan.name.replace("billing.", "").replace("plans.", "")
        : "free_plan";

    switch (planKey) {
      case "tanad_pro":
      case "pro":
        return "bg-purple-800 text-white";
      case "tanad_standard":
      case "standard":
        return "bg-purple-800 text-white";
      case "tanad_business":
      case "business":
        return "bg-green-800 text-white";
      case "tanad_enterprise":
      case "enterprise":
        return "bg-amber-700 text-white";
      case "tanad_free":
      case "free":
      case "free_plan":
      default:
        return "bg-gray-800 text-white";
    }
  };

  // Get background color for the price display section
  const getPlanPriceClass = () => {
    const planKey =
      typeof currentPlan.name === "string"
        ? currentPlan.name.replace("billing.", "").replace("plans.", "")
        : "free_plan";

    switch (planKey) {
      case "tanad_pro":
      case "pro":
        return "bg-purple-900 text-white";
      case "tanad_standard":
      case "standard":
        return "bg-purple-900 text-white";
      case "tanad_business":
      case "business":
        return "bg-green-900 text-white";
      case "tanad_enterprise":
      case "enterprise":
        return "bg-amber-800 text-white";
      case "tanad_free":
      case "free":
      case "free_plan":
      default:
        return "bg-gray-900 text-white";
    }
  };

  return (
    <Card className="h-full w-full overflow-hidden border-2">
      <CardHeader className={`pt-3 pb-3 text-center ${getPlanHeaderClass()}`}>
        <CardTitle>{t("billing.current_plan.title")}</CardTitle>
      </CardHeader>

      <div className={`w-full p-4 text-center ${getPlanPriceClass()}`}>
        <h3 className="text-2xl font-bold">{displayPlanName}</h3>
        <p className="mt-2 text-2xl font-bold">{displayPrice}</p>
        {getStatusBadge() && <div className="mt-3 flex justify-center">{getStatusBadge()}</div>}
      </div>

      <CardContent className="bg-background space-y-4 p-4">
        {/* Next billing date */}
        {currentPlan.nextBillingDate && currentPlan.nextBillingDate !== "-" && (
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">{t("billing.next_billing_date")}</p>
            <p className="font-medium">
              {(() => {
                // Check if the date string is already in Arabic format (containing Arabic numerals)
                const containsArabicNumerals = /[\u0660-\u0669]/.test(currentPlan.nextBillingDate);

                if (containsArabicNumerals) {
                  // If it's already in Arabic format, return it as is
                  return currentPlan.nextBillingDate;
                }

                // Parse DD/MM/YYYY format
                const dateMatch = currentPlan.nextBillingDate.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                if (dateMatch) {
                  const [_, day, month, year] = dateMatch;
                  const date = new Date(Number(year), Number(month) - 1, Number(day));

                  return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                }

                // If not DD/MM/YYYY format, try regular date parsing
                try {
                  return new Date(currentPlan.nextBillingDate).toLocaleDateString(
                    locale === "ar" ? "ar-SA" : "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  );
                } catch (error) {
                  // If all parsing fails, return the original string
                  return currentPlan.nextBillingDate;
                }
              })()}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4">
          {cancelAt ? (
            <Button
              onClick={handleReactivateSubscription}
              className="w-full"
              variant="default"
              disabled={isReactivating}
            >
              {isReactivating ? t("billing.reactivating") : t("billing.reactivate_subscription")}
            </Button>
          ) : (
            status === "active" &&
            currentPlan.name !== "billing.free_plan" && (
              <ConfirmCancelSubscription
                isCanceling={isCanceling}
                setIsCanceling={setIsCanceling}
                handleCancelSubscription={handleCancelSubscription}
              />
            )
          )}

          {/* If on a free plan or canceled/expired subscription, show a button to upgrade */}
          {(status === "canceled" ||
            status === "incomplete_expired" ||
            currentPlan.name === "billing.free_plan") && (
            <Link href="#plans" className="block w-full">
              <Button className="w-full" variant="default">
                {t("billing.upgrade_plan")}
              </Button>
            </Link>
          )}
        </div>
      </CardContent>

      <ConfirmReactivateSubscription
        open={isReactivateDialogOpen}
        onOpenChange={setIsReactivateDialogOpen}
        onReactivate={async () => {
          setIsReactivating(true);
          await onSubscriptionUpdate?.();
          setIsReactivating(false);
        }}
        subscriptionId={id || null}
      />
    </Card>
  );
}
