"use client";

import { Check, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { usePricing } from "@/hooks/use-pricing";
import { useSubscription } from "@/hooks/use-subscription";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";

import { TANAD_PRODUCT_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";

import useUserStore from "@/stores/use-user-store";

import { PaymentDialog } from "./PaymentDialog";

// Add TypeScript declaration for window
declare global {
  interface Window {
    lastSubscriptionRefresh?: number;
    lastSubscriptionFetchTime?: number;
  }
}

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
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const {
    status: subscriptionStatus,
    refetch: refetchSubscription,
    cancelAt: subscriptionCancelAt,
    createSubscription,
    planLookupKey,
  } = useSubscription();
  const { loading: pricesLoading, getPlans } = usePricing(TANAD_PRODUCT_ID);
  const { user, profile, fetchUserAndProfile } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
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
      (plan) => plan.priceId === profile?.price_id || plan.lookup_key === profile?.subscribed_to,
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
  }, [pricesLoading, profile?.price_id, profile?.subscribed_to, freePlan, plans]);

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
    setSelectedPlan(priceId);
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
            t("Billing.subscription_updated_successfully", {
              fallback: "Subscription updated successfully",
            }),
          );

          await Promise.all([fetchUserAndProfile(), refetchSubscription()]);
        }
      }
    } catch (error) {
      toast.error(
        t("Billing.subscription_update_failed", {
          fallback: "Failed to update subscription",
        }),
      );
    } finally {
      setIsLoading(false);
      setIsPaymentDialogOpen(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsPaymentDialogOpen(false);
    setIsLoading(true);
    setSelectedPlan("");

    // Clear any caches to ensure fresh data
    console.log("Payment successful, refreshing subscription data");

    try {
      // Show a loading toast
      const loadingToast = toast.loading("Updating your subscription...");

      // Dispatch custom events immediately to notify other components
      console.log("Broadcasting subscription update events");
      window.dispatchEvent(new CustomEvent("subscription_updated"));

      // Import and use the constant from CurrentPlan
      try {
        const module = await import("@/components/billing/CurrentPlan");
        if (module.SUBSCRIPTION_UPDATED_EVENT) {
          console.log(`Dispatching ${module.SUBSCRIPTION_UPDATED_EVENT} event`);
          window.dispatchEvent(new CustomEvent(module.SUBSCRIPTION_UPDATED_EVENT));
        }
      } catch (err) {
        console.warn("Error dispatching SUBSCRIPTION_UPDATED_EVENT:", err);
      }

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
          // Wait longer between retries
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Clear loading toast
      toast.dismiss(loadingToast);

      // Show success message
      toast.success(
        t("Billing.subscription_updated_successfully", {
          fallback: "Subscription updated successfully",
        }),
      );

      // Force reload the page without confirmation to ensure all components are updated correctly
      setTimeout(() => {
        // Use router.push instead of window.location to preserve locale and Next.js context
        router.push({
          pathname: "/billing",
          query: { refresh: Date.now() }, // Add timestamp to force full refresh
        });
      }, 1500);
    } catch (error) {
      console.error("Error refreshing subscription data:", error);
      toast.error(
        t("Billing.error_updating_subscription", {
          fallback: "There was an error updating your subscription. Please refresh the page.",
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTranslatedFeatures = (plan: any, featureKeys: string[]) => {
    return featureKeys.map((key) => {
      if (key.startsWith("Billing.features.")) {
        return t(key, { fallback: key.replace("Billing.features.", "") });
      }
      return key;
    });
  };

  if (pricesLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  // Hide if user has an active subscription or promotion
  if (
    subscriptionStatus === "active" &&
    !subscriptionCancelAt &&
    planLookupKey &&
    planLookupKey !== "tanad_free"
  ) {
    console.log("SubscriptionSelection: Hiding component due to active paid subscription");
    return null;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSelectPlan(selectedPlan || "");
      }}
      className="w-full"
    >
      {isLoading ? (
        <div className="w-full space-y-4">
          <Skeleton className="mx-auto h-8 w-48" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-[450px] w-full rounded-lg" />
            <Skeleton className="h-[450px] w-full rounded-lg" />
            <Skeleton className="h-[450px] w-full rounded-lg" />
            <Skeleton className="h-[450px] w-full rounded-lg" />
          </div>
        </div>
      ) : (
        <Card className="border-none shadow-none">
          <CardHeader className="pb-2 text-center">
            <h2 className="text-3xl font-bold">
              {t("Billing.subscription_plans", { fallback: "Subscription Plans" })}
            </h2>
            <p className="text-muted-foreground">
              {t("Billing.choose_the_right_plan", {
                fallback: "Choose the plan that best fits your business needs",
              })}
            </p>
            {subscriptionCancelAt && (
              <div className="mt-4 rounded-md bg-amber-50 p-2 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <p className="text-sm font-medium">
                  {t("Billing.subscription_cancels_on", {
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
                  const isPopular =
                    plan.lookup_key === "tanad_pro" || plan.lookup_key?.includes("_pro");
                  const isSelected = selectedPlan === plan.priceId;

                  // Get the plan title based on lookup key or translation
                  const planTitle = t(`Billing.${plan.lookup_key}`, {
                    fallback: planTitles[plan.lookup_key] || plan.name,
                  });

                  // Get plan description from our mapping
                  const planDesc = t(`Billing.${plan.lookup_key}_description`, {
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
                        isSelected
                          ? "border-primary ring-primary/30 bg-primary/5 shadow-sm ring-2"
                          : "",
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
                            {t("Billing.most_popular", { fallback: "Most Popular" })}
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
                            {t("Billing.selected_plan_button", { fallback: "Selected" })}
                          </Badge>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-6">
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
                t("Billing.current_plan", { fallback: "Current Plan" })
              ) : (
                t("Billing.update_plan", { fallback: "Update Plan" })
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t("Billing.payment_details", { fallback: "Payment Details" })}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>
              {t("Billing.payment_dialog_description", {
                fallback: "Complete your subscription by providing payment details.",
              })}
            </p>
            <Button onClick={handleSubscriptionSuccess} className="mt-4" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                t("Billing.complete_subscription", { fallback: "Complete Subscription" })
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}

      {isPaymentDialogOpen && (
        <PaymentDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          selectedPlan={selectedPlan || ""}
          onSuccess={handlePaymentSuccess}
          customerId={profile?.stripe_customer_id || ""}
        />
      )}
    </form>
  );
}
