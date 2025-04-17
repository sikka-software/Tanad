"use client";

import { useEffect, useState } from "react";

import { useLocale, useTranslations } from "next-intl";

import { Check, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { usePricing } from "@/hooks/use-pricing";
import { useSubscription } from "@/hooks/use-subscription";
import useUserStore from "@/hooks/use-user-store";
import { TANAD_PRODUCT_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { PaymentDialog } from "./PaymentDialog";

// Map plan lookup keys to plan titles for direct use in component
const planTitles: Record<string, string> = {
  tanad_free: "Free Plan",
  tanad_standard: "Standard Plan",
  tanad_pro: "Pro Plan",
  tanad_business: "Business Plan",
  tanad_enterprise: "Enterprise Plan",
};

// Map lookup keys to plan descriptions
const planDescriptions: Record<string, string> = {
  tanad_free: "Basic features for individuals",
  tanad_standard: "Advanced features for small teams",
  tanad_pro: "Advanced features for growing businesses",
  tanad_business: "Complete solution for established businesses",
  tanad_enterprise: "Custom solution for large organizations",
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

interface SubscriptionSelectionProps {
  subscription?: any;
  disabled?: boolean;
}

export default function SubscriptionSelection({
  subscription = {},
  disabled = false,
}: SubscriptionSelectionProps) {
  const t = useTranslations();
  const locale = useLocale();
  const {
    status: subscriptionStatus,
    refetch: refetchSubscription,
    cancelAt: subscriptionCancelAt,
  } = useSubscription();
  const { loading: pricesLoading, getPlans } = usePricing(TANAD_PRODUCT_ID);
  const { user, fetchUserAndProfile } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // Set a default selected plan if none is selected
  useEffect(() => {
    if (!selectedPlan && sortedPlans.length > 0 && !pricesLoading) {
      // If no plan is selected yet, select the first non-free plan or the first plan
      const defaultPlan =
        sortedPlans.find((plan) => plan.lookup_key !== "tanad_free") || sortedPlans[0];
      if (defaultPlan) {
        setSelectedPlan(defaultPlan.priceId);
      }
    }
  }, [selectedPlan, sortedPlans, pricesLoading]);

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

  // Function to update the selected plan with debounce protection
  const updateSelectedPlan = (planId: string) => {
    // If we're already in the process of selecting, ignore rapid changes
    if (isSelecting) return;

    // Set selection in progress flag
    setIsSelecting(true);

    // First clear the selection to force re-render
    setSelectedPlan("");

    // Then set the new selection after a short delay
    setTimeout(() => {
      setSelectedPlan(planId);
      setIsSelecting(false);
    }, 100);
  };

  // Update the handlePlanChange function to use the new debounced method
  const handlePlanChange = (value: string) => {
    if (selectedPlan === value) {
      // If clicking the same plan again, use the debounced method
      updateSelectedPlan(value);
    } else {
      setSelectedPlan(value);
    }
  };

  const handleSelectPlan = async (priceId: string) => {
    setIsLoading(true);
    setSelectedPlan(priceId);

    setIsPaymentDialogOpen(true);
  };

  const handleSubscriptionSuccess = async () => {
    setIsPaymentDialogOpen(false);
    setIsLoading(false);
    setSelectedPlan("");
    await Promise.all([refetchSubscription(), fetchUserAndProfile()]);
  };

  if (pricesLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  // Hide if user has an active subscription or promotion
  if (subscriptionStatus && (subscriptionStatus as string) === "active" && !subscriptionCancelAt) {
    return null;
  }

  const handlePaymentSuccess = async () => {
    setIsPaymentDialogOpen(false);
    setIsLoading(false);
    setSelectedPlan(null);

    // Clear any caches to ensure fresh data
    console.log("Payment successful, refreshing subscription data");

    try {
      // Refresh data with multiple retries
      const maxRetries = 3;
      let retryCount = 0;
      let success = false;

      while (retryCount < maxRetries && !success) {
        try {
          // Wait a moment for backend to process the subscription
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Refresh the data
          await Promise.all([refetchSubscription(), fetchUserAndProfile()]);
          console.log("Subscription data refreshed successfully");
          success = true;
        } catch (error) {
          console.error(`Retry ${retryCount + 1}/${maxRetries} failed:`, error);
          retryCount++;
        }
      }

      // Dispatch custom events to notify other components
      console.log("Broadcasting subscription update events");
      window.dispatchEvent(new CustomEvent("subscription_updated"));

      // Force UI refresh
      window.location.hash = "billing";
    } catch (error) {
      console.error("Error refreshing subscription data:", error);
    }
  };

  const getTranslatedFeatures = (plan: any, featureKeys: string[]) => {
    return featureKeys.map((key) => {
      if (key.startsWith("billing.features.")) {
        return t(key, { fallback: key.replace("billing.features.", "") });
      }
      return key;
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSelectPlan(selectedPlan || "");
      }}
      className="w-full"
    >
      {subscriptionCancelAt && (
        <div className="mb-6 rounded-md bg-amber-50 p-3 text-center text-amber-800 dark:bg-amber-950 dark:text-amber-200">
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

      <div dir={locale === "ar" ? "rtl" : "ltr"}>
        <RadioGroup
          value={selectedPlan || ""}
          onValueChange={handlePlanChange}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          key={`plan-selection-${selectedPlan}`}
        >
          {displayPlans.map((plan) => {
            const isCurrentPlan = currentPlan.priceId === plan.priceId;
            const isDisabled =
              plan.lookup_key === "tanad_free" && currentPlan.lookup_key === "tanad_free";
            const isPopular = plan.lookup_key === "tanad_pro" || plan.lookup_key?.includes("_pro");
            const isSelected = selectedPlan === plan.priceId;

            // Get the plan title based on lookup key or translation
            const planTitle = t(`billing.${plan.lookup_key}`, {
              fallback: planTitles[plan.lookup_key] || plan.name,
            });

            // Get plan description from our mapping
            const planDesc = t(`billing.${plan.lookup_key}_description`, {
              fallback: planDescriptions[plan.lookup_key] || `${planTitle} subscription plan`,
            });

            // Format price for display based on locale
            const displayPrice = formatPriceForLocale(plan.price, locale);
            const priceValue = displayPrice.split(" ")[0];
            const priceInterval = locale === "ar" ? "شهرياً" : "/month";

            return (
              <Card
                key={plan.priceId}
                className={cn(
                  "hover:border-primary/70 relative cursor-pointer transition-all duration-200 hover:shadow-sm",
                  isPopular ? "border-primary shadow-md" : "",
                  isSelected ? "border-primary ring-primary/30 bg-primary/5 shadow-sm ring-2" : "",
                  isCurrentPlan && !isSelected ? "bg-muted/50" : "",
                  isDisabled ? "cursor-not-allowed opacity-60" : "",
                )}
                onClick={() => {
                  if (!isDisabled) {
                    if (selectedPlan === plan.priceId) {
                      // Use debounced method for re-selecting the same plan
                      updateSelectedPlan(plan.priceId);
                    } else {
                      setSelectedPlan(plan.priceId);
                    }
                  }
                }}
              >
                <RadioGroupItem
                  className="sr-only"
                  value={plan.priceId}
                  id={plan.priceId}
                  disabled={isDisabled}
                />

                {isPopular && (
                  <div className="absolute -top-3 right-0 left-0 flex justify-center">
                    <Badge className="bg-primary hover:bg-primary/90">
                      {t("billing.most_popular", { fallback: "Most Popular" })}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{planTitle}</CardTitle>
                  <CardDescription>{planDesc}</CardDescription>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{priceValue}</span>
                    <span className="text-muted-foreground ml-1">{priceInterval}</span>
                  </div>

                  <ul className="space-y-2 text-sm">
                    {getTranslatedFeatures(plan, plan.features).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check
                          className={`${locale === "ar" ? "ml-2" : "mr-2"} mt-0.5 h-4 w-4 shrink-0 text-green-500`}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                {isSelected && (
                  <div className="absolute right-2 bottom-2">
                    <Badge variant="outline" className="bg-primary text-primary-foreground">
                      {t("billing.selected_plan_button", { fallback: "Selected" })}
                    </Badge>
                  </div>
                )}
              </Card>
            );
          })}
        </RadioGroup>
      </div>

      <div className="mt-6 flex justify-center pt-6">
        <Button
          type="submit"
          size="lg"
          className="px-8"
          disabled={
            loading ||
            !selectedPlan ||
            (currentPlan.priceId === selectedPlan && !subscriptionCancelAt)
          }
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : currentPlan.priceId === selectedPlan && !subscriptionCancelAt ? (
            t("billing.current_plan", { fallback: "Current Plan" })
          ) : (
            t("billing.update_plan", { fallback: "Update Plan" })
          )}
        </Button>
      </div>
      {isPaymentDialogOpen && (
        <PaymentDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          selectedPlan={selectedPlan || ""}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </form>
  );
}
