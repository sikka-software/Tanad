"use client";

import { useEffect, useState } from "react";

import { useLocale, useTranslations } from "next-intl";

import { Check, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { usePricing } from "@/hooks/use-pricing";
import { useSubscription } from "@/hooks/use-subscription";
import useUserStore from "@/hooks/use-user-store";
import { checkRequiredEnvVars } from "@/lib/check-env";
import { TANAD_PRODUCT_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { PaymentForm } from "./payment-form";

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
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState<string>("");
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [envVarsValid, setEnvVarsValid] = useState(true);

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

  const handlePlanSelection = async () => {
    if (!selectedPlan) {
      toast.error(t("billing.select_plan_error"));
      return;
    }

    try {
      setLoading(true);

      console.log("Selected plan:", selectedPlan);
      console.log("User:", user);
      console.log("User stripe_customer_id:", user?.stripe_customer_id);

      // Check if user and stripe_customer_id exist
      if (!user || !user.stripe_customer_id) {
        throw new Error(
          t("billing.user_not_authenticated", {
            fallback: "User is not authenticated or stripe customer ID is missing",
          }),
        );
      }

      // Find the selected plan from available plans
      const planToSelect = sortedPlans.find((plan) => plan.priceId === selectedPlan);
      if (!planToSelect) {
        throw new Error(
          t("billing.plan_not_found", {
            fallback: "Selected plan not found",
          }),
        );
      }

      // Set plan details for display
      setSelectedPlanName(
        t(`billing.plans.${planToSelect.lookup_key?.replace("tanad_", "")}`, {
          fallback: planToSelect.name,
        }),
      );
      setSelectedPlanPrice(planToSelect.price);

      // Validate Stripe keys first
      if (!envVarsValid) {
        throw new Error(
          t("billing.invalid_stripe_config", {
            fallback: "Stripe is not properly configured. Please contact support.",
          }),
        );
      }

      // Log the parameters for debugging
      console.log("Creating payment intent with:", {
        priceId: selectedPlan,
        customerId: user.stripe_customer_id,
      });

      // Get a payment intent or setup intent client secret
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: selectedPlan,
          customerId: user.stripe_customer_id,
        }),
      });

      // Check for HTTP errors first
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Payment intent API error:", errorData);
        throw new Error(errorData.message || errorData.error || `HTTP error ${response.status}`);
      }

      // Parse the response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error(
          t("billing.invalid_response", {
            fallback: "Invalid response from payment service",
          }),
        );
      }

      // Validate the response data
      if (!data || typeof data !== "object") {
        console.error("Invalid data format:", data);
        throw new Error(
          t("billing.invalid_data", {
            fallback: "Invalid data returned from payment service",
          }),
        );
      }

      // Check for Stripe errors in the response
      if (data.error) {
        console.error("Stripe error in response:", data.error);
        throw new Error(
          data.message ||
            data.error.message ||
            t("billing.payment_setup_failed", {
              fallback: "Failed to set up payment",
            }),
        );
      }

      if (!data.clientSecret) {
        console.error("Missing client secret in response:", data);
        throw new Error(
          t("billing.missing_client_secret", {
            fallback: "No client secret was returned from the payment service",
          }),
        );
      }

      // Set client secret and open payment dialog
      setClientSecret(data.clientSecret);
      setIsPaymentDialogOpen(true);
    } catch (error) {
      console.error("Error selecting plan:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("billing.error_selecting_plan", { fallback: "Error selecting plan" }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionSuccess = async () => {
    setLoading(true);
    try {
      if (!selectedPlan) {
        throw new Error(
          t("billing.no_plan_selected", {
            fallback: "No plan is selected for subscription",
          }),
        );
      }

      if (!user?.stripe_customer_id) {
        throw new Error(
          t("billing.missing_customer_id", {
            fallback: "Stripe customer ID is missing",
          }),
        );
      }

      console.log("Creating subscription with plan ID:", selectedPlan);

      // Attempt to create the subscription with Stripe
      const result = await createSubscription(selectedPlan);

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success(
        t("billing.subscription_updated_successfully", {
          fallback: "Subscription updated successfully",
        }),
      );

      await Promise.all([fetchUserAndProfile(), refetchSubscription()]);
    } catch (error) {
      console.error("Subscription update failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("billing.subscription_update_failed", {
              fallback: "Failed to update subscription",
            }),
      );
    } finally {
      setLoading(false);
      setIsPaymentDialogOpen(false);
    }
  };

  // Check environment variables on component mount
  useEffect(() => {
    try {
      const isValid = checkRequiredEnvVars();
      setEnvVarsValid(isValid);

      if (!isValid) {
        console.error("Stripe environment variables are not properly configured");
      }
    } catch (error) {
      console.error("Error checking environment variables:", error);
      setEnvVarsValid(false);
    }
  }, []);

  if (!envVarsValid) {
    return (
      <Card className="border-amber-300 bg-amber-50 p-4 text-amber-900">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-600" />
          <div>
            <h3 className="mb-1 text-lg font-semibold">Stripe Configuration Missing</h3>
            <p className="mb-2">
              The Stripe API keys are missing or invalid. Please add the required Stripe API keys to
              your environment variables.
            </p>
            <p className="text-sm text-amber-700">
              This is a developer-only message and should not appear in production.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (pricesLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  // Hide if user has an active subscription or promotion
  if (subscriptionStatus && (subscriptionStatus as string) === "active" && !subscriptionCancelAt) {
    return null;
  }

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
        handlePlanSelection();
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
          value={selectedPlan}
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

      <Dialog
        open={isPaymentDialogOpen}
        onOpenChange={(open) => {
          // If dialog is being closed, reset payment-related state
          if (!open) {
            setClientSecret(null);
            if (loading) setLoading(false);
          }
          setIsPaymentDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan &&
                t(`billing.update_to_plan`, {
                  plan: selectedPlanName,
                  fallback: `Update to ${selectedPlanName} Plan`,
                })}
            </DialogTitle>
            <DialogDescription>
              {t("billing.payment_dialog_description", {
                fallback: "Enter your payment details to complete the subscription change",
              })}
              {selectedPlan && (
                <div className="mt-2 font-medium">
                  {t("billing.selected_plan_price", {
                    price: formatPriceForLocale(selectedPlanPrice, locale),
                    fallback: `Price: ${formatPriceForLocale(selectedPlanPrice, locale)}`,
                  })}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          {/* Only render payment form if we have a valid client secret */}
          {clientSecret ? (
            <PaymentForm
              onSuccess={handleSubscriptionSuccess}
              planName={selectedPlanName}
              planPrice={selectedPlanPrice}
              clientSecret={clientSecret}
            />
          ) : (
            <div className="p-4 text-center">
              <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" />
              <p>
                {t("billing.loading_payment_form", {
                  fallback: "Loading payment form...",
                })}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </form>
  );
}
