"use client";

import { useEffect, useState } from "react";

import { useLocale, useTranslations } from "next-intl";

import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePricing } from "@/hooks/use-pricing";
import { useSubscription } from "@/hooks/use-subscription";
import useUserStore from "@/hooks/use-user-store";
import { TANAD_PRODUCT_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";

// Map plan lookup keys to colors and badges
const planColors: Record<
  string,
  { bgClass: string; textClass: string; badge?: string; headerClass: string; badgeClass?: string }
> = {
  tanad_free: {
    bgClass: "bg-gray-900 dark:bg-gray-900",
    textClass: "text-white",
    headerClass: "bg-gray-800 text-white",
  },
  tanad_standard: {
    bgClass: "bg-purple-900 dark:bg-purple-900",
    textClass: "text-white",
    headerClass: "bg-purple-800 text-white",
  },
  tanad_pro: {
    bgClass: "bg-purple-900 dark:bg-purple-900",
    textClass: "text-white",
    badge: "Popular",
    headerClass: "bg-purple-800 text-white",
    badgeClass: "bg-purple-700",
  },
  tanad_business: {
    bgClass: "bg-green-900 dark:bg-green-900",
    textClass: "text-white",
    headerClass: "bg-green-800 text-white",
  },
  tanad_enterprise: {
    bgClass: "bg-amber-800 dark:bg-amber-800",
    textClass: "text-white",
    badge: "Premium",
    headerClass: "bg-amber-700 text-white",
    badgeClass: "bg-amber-600",
  },
};

// Helper function to format price in Arabic
function formatPriceForLocale(price: string, locale: string): string {
  if (locale !== "ar") return price;

  // For Arabic, we need to use Arabic numerals and make sure currency is properly formatted
  const parts = price.split(" ");
  if (parts.length >= 2) {
    const amount = parseFloat(parts[0]);
    const currency = parts[1];

    // Convert to Arabic numerals and format
    const arabicAmount = new Intl.NumberFormat("ar-SA", {
      style: "decimal",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount);

    // Replace SAR with ر.س for Arabic
    const arabicCurrency = currency === "SAR" ? "ر.س" : currency;

    // Format with appropriate spacing for Arabic
    let result = `${arabicAmount} ${arabicCurrency}`;

    // Add interval information if present (like /month)
    if (parts.length > 2 && parts[2].startsWith("/")) {
      const interval = parts[2].substring(1); // remove the slash
      const arabicInterval =
        interval === "month" ? "شهرياً" : interval === "year" ? "سنوياً" : interval;
      result += ` ${arabicInterval}`;
    }

    return result;
  }

  return price;
}

export default function SubscriptionSelection() {
  const t = useTranslations();
  const locale = useLocale();
  const {
    status: subscriptionStatus,
    name: subscriptionName,
    refetch: refetchSubscription,
    cancelAt: subscriptionCancelAt,
    createSubscription,
  } = useSubscription();
  const { loading: pricesLoading, getPlans } = usePricing(TANAD_PRODUCT_ID);
  const { user, fetchUserAndProfile } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const plans = getPlans();
  // Sort plans by price (ascending)
  const sortedPlans = [...plans].sort((a, b) => {
    const priceA = parseFloat(a.price.split(" ")[0]) || 0;
    const priceB = parseFloat(b.price.split(" ")[0]) || 0;
    return priceA - priceB;
  });

  // In Arabic, we reverse the order of plans to display from right to left
  const displayPlans = locale === "ar" ? [...sortedPlans].reverse() : sortedPlans;

  const freePlan = plans.find((plan) => plan.lookup_key === "tanad_free");

  const [currentPlan, setCurrentPlan] = useState<{
    priceId: string;
    lookup_key: string;
  }>({
    priceId: freePlan?.priceId || "",
    lookup_key: freePlan?.lookup_key || "",
  });

  useEffect(() => {
    if (pricesLoading) return;

    const newCurrentPlan = { ...currentPlan };
    const currentTier = plans.find(
      (plan) => plan.priceId === user?.price_id || plan.lookup_key === user?.subscribed_to,
    );

    if (currentTier) {
      newCurrentPlan.priceId = currentTier.priceId;
      newCurrentPlan.lookup_key = currentTier.lookup_key;
    } else if (freePlan) {
      newCurrentPlan.priceId = freePlan.priceId;
      newCurrentPlan.lookup_key = freePlan.lookup_key;
    }

    if (
      currentPlan.priceId !== newCurrentPlan.priceId ||
      currentPlan.lookup_key !== newCurrentPlan.lookup_key
    ) {
      setCurrentPlan(newCurrentPlan);
    }
  }, [pricesLoading, user?.price_id, user?.subscribed_to, freePlan, plans]);

  const handlePlanSelection = async () => {
    if (!selectedPlan) return;
    if (!user) {
      toast.error(
        t("please_sign_in_to_update_your_subscription", {
          fallback: "Please sign in to update your subscription",
        }),
      );
      return;
    }

    if (currentPlan.priceId === selectedPlan && !subscriptionCancelAt) {
      toast.error(
        t("you_are_already_subscribed_to_this_plan", {
          fallback: "You are already subscribed to this plan",
        }),
      );
      return;
    }

    setIsPaymentDialogOpen(true);
  };

  const handleSubscriptionSuccess = async () => {
    setIsLoading(true);
    try {
      if (selectedPlan) {
        // Attempt to create the subscription with Stripe
        const result = await createSubscription(selectedPlan);

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(
            t("billing.subscription_updated_successfully", {
              fallback: "Subscription updated successfully",
            }),
          );

          await Promise.all([fetchUserAndProfile(), refetchSubscription()]);
        }
      }
    } catch (error) {
      toast.error(
        t("billing.subscription_update_failed", {
          fallback: "Failed to update subscription",
        }),
      );
    } finally {
      setIsLoading(false);
      setIsPaymentDialogOpen(false);
    }
  };

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
  };

  if (pricesLoading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  // Hide if user has an active subscription or promotion
  if (subscriptionStatus && (subscriptionStatus as string) === "active" && !subscriptionCancelAt) {
    return null;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handlePlanSelection();
      }}
    >
      <Card className="border-none shadow-none">
        <CardHeader className="pb-2 text-center">
          <h2 className="text-3xl font-bold">
            {t("billing.subscription_plans", { fallback: "Subscription Plans" })}
          </h2>
          <p className="text-muted-foreground">
            {t("billing.choose_the_right_plan", {
              fallback: "Choose the plan that best fits your business needs",
            })}
          </p>
          {subscriptionCancelAt && (
            <div className="mt-4 rounded-md bg-amber-50 p-2 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <p className="text-sm font-medium">
                {t("billing.subscription_cancels_on", {
                  date: new Date(Number(subscriptionCancelAt) * 1000).toLocaleDateString(
                    locale === "ar" ? "ar-SA" : "en-US",
                  ),
                  fallback: `Subscription cancels on ${new Date(Number(subscriptionCancelAt) * 1000).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}`,
                })}
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent dir={locale === "ar" ? "rtl" : "ltr"} className="pt-6">
          <RadioGroup
            value={selectedPlan}
            onValueChange={handlePlanChange}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {displayPlans.map((plan) => {
              const planColor = planColors[plan.lookup_key] || {
                bgClass: "bg-gray-100 dark:bg-gray-800",
                textClass: "text-gray-800 dark:text-gray-200",
                headerClass: "bg-gray-800 text-white",
              };
              const isCurrentPlan = currentPlan.priceId === plan.priceId;
              const isDisabled =
                plan.lookup_key === "tanad_free" && currentPlan.lookup_key === "tanad_free";

              // Extract amount and format plan name for display
              const planName = t(`billing.${plan.lookup_key}`, { fallback: plan.name });
              const displayPrice = formatPriceForLocale(plan.price, locale);

              return (
                <div key={plan.priceId} className="flex w-full">
                  <RadioGroupItem
                    className="sr-only"
                    value={plan.priceId}
                    id={plan.priceId}
                    disabled={isDisabled}
                  />
                  <Label
                    htmlFor={plan.priceId}
                    className={cn(
                      "relative flex h-full w-full cursor-pointer flex-col items-start overflow-hidden rounded-xl border-2 p-0 transition-all",
                      selectedPlan === plan.priceId
                        ? "border-primary ring-primary/20 ring-2"
                        : "border-muted hover:border-muted-foreground/50",
                      isCurrentPlan && "bg-primary/5",
                      isDisabled && "cursor-not-allowed opacity-60",
                    )}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    {planColor.badge && (
                      <div
                        className={cn(
                          "absolute top-0 z-10 overflow-hidden",
                          locale === "ar" ? "left-0 rtl:left-0" : "right-0",
                        )}
                      >
                        <div
                          className={cn(
                            "w-24 translate-x-[30%] translate-y-[-30%] rotate-45 px-2 py-1 text-center text-[10px] font-medium text-white",
                            planColor.badgeClass || "bg-primary",
                          )}
                        >
                          {t(`billing.badge.${planColor.badge.toLowerCase()}`, {
                            fallback: planColor.badge,
                          })}
                        </div>
                      </div>
                    )}

                    <div className={cn("w-full py-3 text-center", planColor.headerClass)}>
                      <h3 className="text-xl font-bold">
                        {t(`billing.${plan.lookup_key}`, { fallback: planName })}
                      </h3>
                    </div>

                    <div className={cn("w-full py-3 text-center", planColor.bgClass)}>
                      <p className={cn("text-2xl font-bold", planColor.textClass)}>
                        {displayPrice}
                      </p>
                    </div>

                    <div className="bg-background w-full flex-1 space-y-4 p-4">
                      <div className="space-y-3 text-sm">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                            <span>{feature.startsWith("billing.") ? t(feature) : feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto w-full p-4 pt-0">
                      <Button
                        type="button"
                        variant={selectedPlan === plan.priceId ? "default" : "outline"}
                        className="w-full"
                        onClick={() => !isDisabled && setSelectedPlan(plan.priceId)}
                        disabled={isDisabled}
                      >
                        {isCurrentPlan
                          ? t("billing.current_plan_button", { fallback: "Current Plan" })
                          : t("billing.select_plan_button", { fallback: "Select Plan" })}
                      </Button>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-center pt-6">
          <Button
            type="submit"
            size="lg"
            className="px-8"
            disabled={
              isLoading ||
              !selectedPlan ||
              (currentPlan.priceId === selectedPlan && !subscriptionCancelAt)
            }
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : currentPlan.priceId === selectedPlan && !subscriptionCancelAt ? (
              t("billing.current_plan", { fallback: "Current Plan" })
            ) : (
              t("billing.update_plan", { fallback: "Update Plan" })
            )}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t("billing.payment_details", { fallback: "Payment Details" })}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>
              {t("billing.payment_dialog_description", {
                fallback: "Complete your subscription by providing payment details.",
              })}
            </p>
            <Button onClick={handleSubscriptionSuccess} className="mt-4" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                t("billing.complete_subscription", { fallback: "Complete Subscription" })
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
