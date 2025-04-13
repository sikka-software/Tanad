"use client";

import { useContext, useEffect, useState } from "react";

import { useLocale, useTranslations } from "next-intl";

import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { UserContext } from "@/components/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePricing } from "@/hooks/use-pricing";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";

export default function SubscriptionSelection() {
  const t = useTranslations();
  const locale = useLocale();
  const {
    status: subscriptionStatus,
    name: subscriptionName,
    refetch: refetchSubscription,
    cancelAt: subscriptionCancelAt,
  } = useSubscription();
  const { loading: pricesLoading, getPlans } = usePricing();
  const { user, refreshUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const plans = getPlans();
  const freePlan = plans.find((plan) => plan.lookup_key === "lazim_free");

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

    if (currentPlan.lookup_key === selectedPlan && !subscriptionCancelAt) {
      toast.error(
        t("you_are_already_subscribed_to_this_plan", {
          fallback: "You are already subscribed to this plan",
        }),
      );
      return;
    }

    // Simply open the payment dialog
    setIsPaymentDialogOpen(true);
  };

  const handleSubscriptionSuccess = async () => {
    setIsPaymentDialogOpen(false);
    await Promise.all([refreshUser(), refetchSubscription()]);
  };

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
  };

  if (pricesLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  // Hide if user has an active subscription or promotion
  if (subscriptionStatus && (subscriptionStatus as string) === "active") {
    return null;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handlePlanSelection();
      }}
    >
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">
            {t("Billing.subscription_plans", { fallback: "Subscription Plans" })}
          </h2>
          {subscriptionCancelAt ? (
            <p className="text-muted-foreground text-sm">
              {t("Billing.subscription_cancels_on", {
                date: new Date(Number(subscriptionCancelAt) * 1000).toLocaleDateString(
                  locale === "ar" ? "ar-SA" : "en-US",
                ),
                fallback: `Subscription cancels on ${new Date(Number(subscriptionCancelAt) * 1000).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}`,
              })}
            </p>
          ) : (
            subscriptionStatus === "active" && (
              <p className="text-muted-foreground text-sm">
                {t("Billing.current_subscription", {
                  plan: subscriptionName || "",
                  fallback: `Current subscription: ${subscriptionName || "Free"}`,
                })}
              </p>
            )
          )}
        </CardHeader>
        <CardContent dir={locale === "ar" ? "rtl" : "ltr"}>
          <RadioGroup value={selectedPlan} onValueChange={handlePlanChange} className="grid gap-6">
            {plans.map((plan) => (
              <div key={plan.priceId} className="flex w-full items-center gap-4">
                <RadioGroupItem
                  className="sr-only"
                  value={plan.priceId}
                  id={plan.priceId}
                  disabled={
                    plan.lookup_key === "lazim_free" && currentPlan.lookup_key === "lazim_free"
                  }
                />
                <Label
                  htmlFor={plan.priceId}
                  className={cn(
                    "peer-data-[state=checked]:border-primary flex w-full cursor-pointer flex-col items-start gap-2 rounded-md border p-4",
                    selectedPlan === plan.priceId && "border-primary",
                    plan.lookup_key === "lazim_free" &&
                      currentPlan.lookup_key === "lazim_free" &&
                      "cursor-not-allowed opacity-50",
                  )}
                  dir={locale === "ar" ? "rtl" : "ltr"}
                >
                  <div className="flex w-full flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="text-xl font-semibold">{plan.name}</div>
                      </div>
                      <div className="text-muted-foreground mt-2 space-y-1 text-sm">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <p className="text-lg font-semibold whitespace-nowrap">{plan.price}</p>
                      {selectedPlan === plan.priceId && (
                        <Check className="text-primary h-5 w-5 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !selectedPlan || currentPlan.priceId === selectedPlan}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : currentPlan.priceId === selectedPlan ? (
              t("Billing.current_plan", { fallback: "Current Plan" })
            ) : (
              t("Billing.update_plan", { fallback: "Update Plan" })
            )}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
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
            <Button onClick={handleSubscriptionSuccess} className="mt-4">
              {t("Billing.complete_subscription", { fallback: "Complete Subscription" })}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
