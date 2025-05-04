import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { usePricing } from "@/hooks/use-pricing";

import { TANAD_PRODUCT_ID } from "@/lib/constants";

import useUserStore from "@/stores/use-user-store";

// Global variable to track if subscription has been loaded already
declare global {
  interface Window {
    lastSubscriptionRefresh?: number;
    lastSubscriptionFetchTime?: number;
    subscriptionInitialized?: boolean;
    subscriptionFetchAttempts?: number;
    tanadSubscriptionDataCached?: boolean;
  }
}

// Cache for subscription requests to prevent duplicate API calls
let lastRequestTime = 0;
let requestPromise: Promise<any> | null = null;

interface SubscriptionData {
  id: string | null;
  name: string | null;
  price: string | null;
  billingCycle: string | null;
  nextBillingDate: string | null;
  planLookupKey: string | null;
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
    name: t("Billing.free_plan", { fallback: "Free Plan" }),
    price: "0 SAR",
    billingCycle: "-",
    nextBillingDate: "-",
    planLookupKey: null,
    status: null,
    isExpired: false,
    cancelAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile, loading: userLoading, fetchUserAndProfile } = useUserStore();
  const lastRefetchRef = useRef<number | null>(null);

  // Add visibility change listener to prevent refreshes when tab regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Page has become visible again after tab switch
        console.log("Page visibility changed to visible - preventing subscription refresh");
        // Set a flag to prevent refreshes for a short time
        window.tanadSubscriptionDataCached = true;

        // Clear the flag after a short delay
        setTimeout(() => {
          window.tanadSubscriptionDataCached = false;
        }, 5000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Also handle window focus events for Alt+Tab between applications
    const handleWindowFocus = () => {
      console.log("Window regained focus - preventing subscription refresh");
      window.tanadSubscriptionDataCached = true;

      setTimeout(() => {
        window.tanadSubscriptionDataCached = false;
      }, 5000);
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  const fetchSubscription = async () => {
    // If we've just switched back to the tab/window, skip fetching
    if (window.tanadSubscriptionDataCached) {
      console.log("Skipping subscription fetch - page just regained focus");
      return;
    }

    setLoading(true);
    setError(null);

    // Increment fetch attempt counter
    window.subscriptionFetchAttempts = (window.subscriptionFetchAttempts || 0) + 1;

    // If we've tried too many times, just set free plan and stop
    if (window.subscriptionFetchAttempts > 2) {
      console.log("Too many subscription fetch attempts, defaulting to free plan");
      const freePlan = getPlans().find(
        (plan) => plan.lookup_key === "tanad_free" || plan.lookup_key?.includes("free"),
      );
      setSubscriptionData({
        id: null,
        name: freePlan?.name || t("Billing.free_plan", { fallback: "Free Plan" }),
        price: "0 SAR",
        billingCycle: "-",
        nextBillingDate: "-",
        planLookupKey: freePlan?.lookup_key || "tanad_free",
        status: null,
        isExpired: false,
        cancelAt: null,
      });
      setLoading(false);
      window.subscriptionInitialized = true;
      return;
    }

    try {
      const plans = getPlans();

      // Wait until plans are loaded
      if (plansLoading || plans.length === 0) {
        console.log("Plans are still loading or empty, waiting...");
        return;
      }

      // Log current profile data
      console.log("Current profile data:", {
        id: profile?.id,
        email: profile?.email,
        stripe_customer_id: profile?.stripe_customer_id,
        subscribed_to: profile?.subscribed_to,
        price_id: profile?.price_id,
      });

      // Find free plan
      const freePlan = plans.find(
        (plan) => plan.lookup_key === "tanad_free" || plan.lookup_key?.includes("free"),
      );

      // Check if user has a subscription in their profile
      if (profile?.subscribed_to && profile.subscribed_to !== "tanad_free") {
        console.log(`Profile indicates user is subscribed to: ${profile.subscribed_to}`);

        // Try to find matching plan from the subscribed_to value
        const profilePlan = plans.find((plan) => plan.lookup_key === profile.subscribed_to);
        if (profilePlan) {
          console.log("Found matching plan from profile.subscribed_to:", profilePlan);
        }
      }

      // If no user or customer ID, return free plan
      if (!user || !profile?.stripe_customer_id) {
        console.log("No customer ID found, returning free plan");
        setSubscriptionData({
          id: null,
          name: freePlan?.name || t("plans.free.title"),
          price: "0 SAR",
          billingCycle: "-",
          nextBillingDate: "-",
          planLookupKey: freePlan?.lookup_key || null,
          status: null,
          isExpired: false,
          cancelAt: null,
        });
        setLoading(false);
        return;
      }

      // Use cached request if it's recent enough (within 2 seconds)
      const now = Date.now();
      if (requestPromise && now - lastRequestTime < 2000) {
        console.log("Using cached subscription request");
        await requestPromise;
        return;
      }

      // Fetch subscription from API
      lastRequestTime = now;
      requestPromise = (async () => {
        const response = await fetch("/api/stripe/subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId: profile?.stripe_customer_id,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch subscription: ${response.status}`);
        }

        return await response.json();
      })();

      const { subscription } = await requestPromise;
      if (subscription) {
        // Access plan details directly from the plan property
        const planDetails = subscription.plan || {};

        // Get price ID directly from plan
        const currentPriceId = planDetails.id || subscription.items?.data[0]?.price?.id;

        // Get plan name from multiple possible sources
        const planName =
          planDetails.nickname ||
          subscription.items?.data[0]?.price?.nickname ||
          subscription.product?.name ||
          "Unknown Plan";

        // Get the lookup_key from the plan
        const planLookupKey =
          planDetails.lookup_key || subscription.items?.data[0]?.price?.lookup_key || null;

        // Try to find matching plan
        let currentPlan = plans.find((plan) => {
          return plan.priceId === currentPriceId;
        });

        // Format next billing date from billing_cycle_anchor
        const nextBillingTimestamp =
          subscription.billing_cycle_anchor || subscription.current_period_end;
        const nextBillingDate = nextBillingTimestamp
          ? new Date(nextBillingTimestamp * 1000).toLocaleDateString()
          : "-";

        if (currentPlan) {
          // Calculate price from plan or subscription
          const priceAmount = planDetails.amount
            ? (planDetails.amount / 100).toFixed(2)
            : subscription.items?.data[0]?.price?.unit_amount
              ? (subscription.items.data[0].price.unit_amount / 100).toFixed(2)
              : "0";

          const priceCurrency =
            planDetails.currency?.toUpperCase() ||
            subscription.items?.data[0]?.price?.currency?.toUpperCase() ||
            "SAR";

          // Build subscription data
          const newSubscriptionData: SubscriptionData = {
            id: subscription.id,
            name: currentPlan.name || planName,
            price: `${priceAmount} ${priceCurrency}`,
            billingCycle:
              planDetails.interval ||
              subscription.items?.data[0]?.price?.recurring?.interval ||
              "-",
            nextBillingDate,
            planLookupKey: currentPlan.lookup_key || planLookupKey,
            status: subscription.status,
            isExpired:
              subscription.status === "canceled" || subscription.status === "incomplete_expired",
            cancelAt: subscription.cancel_at,
          };

          setSubscriptionData(newSubscriptionData);
          console.log("Subscription loaded:", newSubscriptionData);
        } else {
          // If plan not found but subscription exists, use subscription data directly
          console.log("Plan not found in available plans, using subscription data directly");

          const priceAmount = planDetails.amount
            ? (planDetails.amount / 100).toFixed(2)
            : subscription.items?.data[0]?.price?.unit_amount
              ? (subscription.items.data[0].price.unit_amount / 100).toFixed(2)
              : "0";

          const priceCurrency =
            planDetails.currency?.toUpperCase() ||
            subscription.items?.data[0]?.price?.currency?.toUpperCase() ||
            "SAR";

          setSubscriptionData({
            id: subscription.id,
            name: planName,
            price: `${priceAmount} ${priceCurrency}`,
            billingCycle:
              planDetails.interval ||
              subscription.items?.data[0]?.price?.recurring?.interval ||
              "-",
            nextBillingDate,
            planLookupKey,
            status: subscription.status,
            isExpired:
              subscription.status === "canceled" || subscription.status === "incomplete_expired",
            cancelAt: subscription.cancel_at,
          });
        }
      } else {
        // No subscription found from Stripe API
        console.log("No active subscription found from Stripe API");

        // Check if profile has subscribed_to that's not the free plan
        if (profile?.subscribed_to && profile.subscribed_to !== "tanad_free") {
          console.log(`Using subscription info from profile: ${profile.subscribed_to}`);

          // Try to find the plan based on the profile's subscribed_to value
          const profilePlan = plans.find((plan) => plan.lookup_key === profile.subscribed_to);

          if (profilePlan) {
            console.log("Found matching plan from profile:", profilePlan);

            // Use the profile plan details
            setSubscriptionData({
              id: "profile-based", // Placeholder ID
              name: profilePlan.name || profile.subscribed_to,
              price: profilePlan.price || profile.price_id || "Price unavailable",
              billingCycle: "month", // Default to month
              nextBillingDate: "-", // No next billing date available
              planLookupKey: profilePlan.lookup_key || profile.subscribed_to,
              status: "active", // Assume active since it's in the profile
              isExpired: false,
              cancelAt: null,
            });
            setLoading(false);
            return;
          }
        }

        // If no profile subscription info or no matching plan, default to free plan
        setSubscriptionData({
          id: null,
          name: freePlan?.name || t("plans.free.title"),
          price: "0 SAR",
          billingCycle: "-",
          nextBillingDate: "-",
          planLookupKey: freePlan?.lookup_key || null,
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
      if (!user || !profile?.stripe_customer_id) {
        throw new Error("User not authenticated or missing stripe customer ID");
      }

      const response = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          customerId: profile?.stripe_customer_id,
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

  // Fix the useEffect to prevent infinite loops
  useEffect(() => {
    // Skip if the page just regained focus after tab switch or Alt+Tab
    if (window.tanadSubscriptionDataCached) {
      console.log("Skipping subscription initialization - page just regained focus");
      return;
    }

    // Skip completely if we've already initialized the subscription
    if (window.subscriptionInitialized) {
      return;
    }

    // Generate a unique ID for this effect execution for logging
    const fetchId = Math.random().toString(36).slice(2, 9);
    console.log(`[${fetchId}] Subscription hook effect running - first load check`);

    // Skip if we don't have the prerequisites
    if (userLoading || !user || plansLoading) {
      return;
    }

    // If we have a valid subscription already, mark as initialized and skip
    if (subscriptionData.id && subscriptionData.id !== "profile-based") {
      console.log(`[${fetchId}] Subscription data already exists, marking as initialized`);
      window.subscriptionInitialized = true;
      return;
    }

    // At this point, we're ready to fetch and haven't done so yet
    console.log(`[${fetchId}] Initial subscription fetch starting`);

    // Mark as initialized immediately to prevent duplicate executions
    window.subscriptionInitialized = true;

    // Execute the fetch once
    const doFetch = async () => {
      try {
        await fetchSubscription();
        console.log(`[${fetchId}] Initial subscription fetch completed`);
      } catch (error) {
        console.error(`[${fetchId}] Error in initial subscription fetch:`, error);
        // Reset the flag in case of error
        window.subscriptionInitialized = false;
      }
    };

    doFetch();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoading, user, plansLoading]);

  /**
   * Refetch the subscription data
   */
  const refetch = async () => {
    console.log("Refetching subscription data");

    // Check if we've recently refetched to prevent excessive API calls
    const now = Date.now();
    const lastRefetch = lastRefetchRef.current || 0;
    if (now - lastRefetch < 2000) {
      console.log("Skipping refetch - too soon since last refetch");
      return true;
    }
    lastRefetchRef.current = now;

    // First refresh user and profile data
    try {
      await fetchUserAndProfile();
      console.log("User and profile data refreshed");
    } catch (profileError) {
      console.error("Error refreshing user profile:", profileError);
    }

    // Then fetch subscription data
    await fetchSubscription();
    console.log("Subscription refetch complete");

    // Update state to indicate data was refreshed
    return true;
  };

  // Ensure we have at least the free plan when no subscription data is loaded
  useEffect(() => {
    // If we've been in loading state for too long (5 seconds), just show free plan
    if (loading) {
      const timeoutId = setTimeout(() => {
        if (loading && !subscriptionData.id) {
          console.log("Subscription loading timed out, defaulting to free plan");
          const freePlan = getPlans().find(
            (plan) => plan.lookup_key === "tanad_free" || plan.lookup_key?.includes("free"),
          );
          setSubscriptionData({
            id: null,
            name: freePlan?.name || t("Billing.free_plan", { fallback: "Free Plan" }),
            price: "0 SAR",
            billingCycle: "-",
            nextBillingDate: "-",
            planLookupKey: freePlan?.lookup_key || "tanad_free",
            status: null,
            isExpired: false,
            cancelAt: null,
          });
          setLoading(false);
        }
      }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [loading]);

  // The subscription data and utility functions to expose
  return {
    ...subscriptionData,
    loading,
    error,
    refetch,
    createSubscription,
    updateSubscription,
    cancelSubscription,
  };
}
