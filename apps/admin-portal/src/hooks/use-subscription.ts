import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { usePricing } from "@/hooks/use-pricing";
import useUserStore from "@/hooks/use-user-store";
import { TANAD_PRODUCT_ID } from "@/lib/constants";

interface SubscriptionData {
  id: string | null;
  name: string | null;
  price: string | null;
  billingCycle: string | null;
  nextBillingDate: string | null;
  status:
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "trialing"
    | "unpaid"
    | "paused"
    | null;
  isExpired: boolean;
  cancelAt: number | null;
}

interface CreateSubscriptionResponse {
  subscriptionId: string;
  clientSecret: string | null;
  status: string;
  error?: string;
}

interface UpdateSubscriptionResponse {
  subscriptionId: string;
  status: string;
  message: string;
  error?: string;
}

interface CancelSubscriptionResponse {
  success: boolean;
  subscriptionId: string;
  status: string;
  cancelAt: number | null;
  message: string;
  error?: string;
}

export function useSubscription() {
  const t = useTranslations();
  const { getPlans, loading: plansLoading } = usePricing(TANAD_PRODUCT_ID);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    id: null,
    name: t("billing.free_plan", { fallback: "Free Plan" }),
    price: "0 SAR",
    billingCycle: "-",
    nextBillingDate: "-",
    status: null,
    isExpired: false,
    cancelAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: userLoading, fetchUserAndProfile } = useUserStore();

  const fetchSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      const plans = getPlans();

      // Wait until plans are loaded
      if (plansLoading || plans.length === 0) {
        console.log("Plans are still loading or empty, waiting...");
        return;
      }

      // Find free plan
      const freePlan = plans.find(
        (plan) => plan.lookup_key === "tanad_free" || plan.lookup_key?.includes("free"),
      );

      // If no user or customer ID, return free plan
      if (!user || !user.stripe_customer_id) {
        console.log("No customer ID found, returning free plan");
        setSubscriptionData({
          id: null,
          name: freePlan?.name || t("plans.free.title"),
          price: "0 SAR",
          billingCycle: "-",
          nextBillingDate: "-",
          status: null,
          isExpired: false,
          cancelAt: null,
        });
        setLoading(false);
        return;
      }

      // Fetch subscription from API
      const response = await fetch("/api/stripe/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: user.stripe_customer_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.status}`);
      }

      const { subscription } = await response.json();

      if (subscription) {
        // Get price ID and lookup key from subscription
        const currentPriceId = subscription.items.data[0].price.id;
        const lookupKey = subscription.items.data[0].price.lookup_key;

        // Try to find matching plan
        let currentPlan = plans.find((plan) => {
          return plan.priceId === currentPriceId || (lookupKey && plan.lookup_key === lookupKey);
        });

        if (currentPlan) {
          // Format next billing date
          const nextBillingDate = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
            : "-";

          // Calculate price from subscription or use plan price
          const priceAmount = subscription.items.data[0].price.unit_amount
            ? (subscription.items.data[0].price.unit_amount / 100).toFixed(2)
            : "0";

          const priceCurrency = subscription.items.data[0].price.currency?.toUpperCase() || "SAR";

          // Build subscription data
          const newSubscriptionData: SubscriptionData = {
            id: subscription.id,
            name: currentPlan.name,
            price: `${priceAmount} ${priceCurrency}`,
            billingCycle: subscription.items.data[0].price.recurring?.interval || "-",
            nextBillingDate,
            status: subscription.status,
            isExpired:
              subscription.status === "canceled" || subscription.status === "incomplete_expired",
            cancelAt: subscription.cancel_at,
          };

          setSubscriptionData(newSubscriptionData);
          console.log("Subscription loaded:", newSubscriptionData);
        } else {
          // If plan not found but subscription exists, use subscription data
          console.log("Plan not found in available plans, using subscription data directly");

          const productName = subscription.items.data[0].price.product?.name || "Unknown Plan";
          const priceAmount = subscription.items.data[0].price.unit_amount
            ? (subscription.items.data[0].price.unit_amount / 100).toFixed(2)
            : "0";
          const priceCurrency = subscription.items.data[0].price.currency?.toUpperCase() || "SAR";

          setSubscriptionData({
            id: subscription.id,
            name: productName,
            price: `${priceAmount} ${priceCurrency}`,
            billingCycle: subscription.items.data[0].price.recurring?.interval || "-",
            nextBillingDate: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
              : "-",
            status: subscription.status,
            isExpired:
              subscription.status === "canceled" || subscription.status === "incomplete_expired",
            cancelAt: subscription.cancel_at,
          });
        }
      } else {
        // No subscription found, use free plan
        setSubscriptionData({
          id: null,
          name: freePlan?.name || t("plans.free.title"),
          price: "0 SAR",
          billingCycle: "-",
          nextBillingDate: "-",
          status: null,
          isExpired: false,
          cancelAt: null,
        });
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch subscription");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new subscription for the user
   */
  const createSubscription = async (priceId: string): Promise<CreateSubscriptionResponse> => {
    try {
      if (!user || !user.stripe_customer_id) {
        throw new Error("User not authenticated or missing stripe customer ID");
      }

      const response = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          customerId: user.stripe_customer_id,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create subscription");
      }

      const data = await response.json();

      // Refresh user data and subscription data
      await fetchUserAndProfile();
      await fetchSubscription();

      return data;
    } catch (error) {
      console.error("Error creating subscription:", error);
      return {
        subscriptionId: "",
        clientSecret: null,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  };

  /**
   * Update an existing subscription
   */
  const updateSubscription = async (priceId: string): Promise<UpdateSubscriptionResponse> => {
    try {
      if (!user || !subscriptionData.id) {
        throw new Error("No active subscription to update");
      }

      const response = await fetch("/api/stripe/update-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: subscriptionData.id,
          priceId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update subscription");
      }

      const data = await response.json();

      // Refresh user data and subscription data
      await fetchUserAndProfile();
      await fetchSubscription();

      return data;
    } catch (error) {
      console.error("Error updating subscription:", error);
      return {
        subscriptionId: "",
        status: "error",
        message: "",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  };

  /**
   * Cancel an existing subscription
   */
  const cancelSubscription = async (
    cancelAtPeriodEnd = true,
  ): Promise<CancelSubscriptionResponse> => {
    try {
      if (!user || !subscriptionData.id) {
        throw new Error("No active subscription to cancel");
      }

      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: subscriptionData.id,
          userId: user.id,
          cancelAtPeriodEnd,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel subscription");
      }

      const data = await response.json();

      // Refresh user data and subscription data
      await fetchUserAndProfile();
      await fetchSubscription();

      return data;
    } catch (error) {
      console.error("Error canceling subscription:", error);
      return {
        success: false,
        subscriptionId: "",
        status: "error",
        cancelAt: null,
        message: "",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  };

  // Fetch subscription when dependency changes
  useEffect(() => {
    if (!userLoading && !plansLoading) {
      fetchSubscription();
    }
  }, [user?.stripe_customer_id, user?.id, user?.subscribed_to, plansLoading, userLoading]);

  // The subscription data and utility functions to expose
  return {
    ...subscriptionData,
    loading: loading || plansLoading || userLoading,
    error,
    refetch: fetchSubscription,
    createSubscription,
    updateSubscription,
    cancelSubscription,
  };
}
