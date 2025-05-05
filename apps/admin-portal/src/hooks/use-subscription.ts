import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { createClient } from "@/utils/supabase/component";

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
    lastFocusTime?: number; // Track when window was last focused
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

// Add helper function for date conversion
const convertTimestampToDate = (timestamp: number | null): string => {
  if (!timestamp) return "-";
  try {
    return new Date(timestamp * 1000).toLocaleDateString();
  } catch (error) {
    console.error("Error converting timestamp to date:", error);
    return "-";
  }
};

// Add helper function to get price from lookup key
const getPriceFromLookupKey = (lookupKey: string): string => {
  if (!lookupKey) return "0 SAR";

  switch (lookupKey) {
    case "tanad_standard":
      return "19.99 SAR";
    case "tanad_pro":
      return "49.99 SAR";
    case "tanad_business":
      return "99.99 SAR";
    case "tanad_enterprise":
      return "199.99 SAR";
    default:
      return "0 SAR";
  }
};

// Add helper function to get name from lookup key
const getNameFromLookupKey = (lookupKey: string): string => {
  if (!lookupKey) return "Free Plan";

  switch (lookupKey) {
    case "tanad_standard":
      return "Standard Plan";
    case "tanad_pro":
      return "Pro Plan";
    case "tanad_business":
      return "Business Plan";
    case "tanad_enterprise":
      return "Enterprise Plan";
    default:
      return "Free Plan";
  }
};

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
  const initialLoadDone = useRef(false);
  const lastFetchTime = useRef<number | null>(null);

  // Add visibility change listener to prevent refreshes when tab regains focus
  useEffect(() => {
    const cacheDuration = 30000; // 30 seconds to prevent refreshes after focus

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Page has become visible again after tab switch
        console.log("Page visibility changed to visible - preventing subscription refresh");
        // Set a flag to prevent refreshes for a short time
        window.tanadSubscriptionDataCached = true;
        window.lastFocusTime = Date.now();

        // Clear the flag after a longer delay to prevent unwanted refreshes
        setTimeout(() => {
          window.tanadSubscriptionDataCached = false;
        }, cacheDuration);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Also handle window focus events for Alt+Tab between applications
    const handleWindowFocus = () => {
      console.log("Window regained focus - preventing subscription refresh");
      window.tanadSubscriptionDataCached = true;
      window.lastFocusTime = Date.now();

      setTimeout(() => {
        window.tanadSubscriptionDataCached = false;
      }, cacheDuration);
    };

    window.addEventListener("focus", handleWindowFocus);

    // Set initial focus time if not set
    if (!window.lastFocusTime) {
      window.lastFocusTime = Date.now();
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  /**
   * Fetch subscription data from the server
   */
  const fetchSubscription = async (forceRefresh = false) => {
    if (!user) {
      console.log("No user, skipping subscription fetch");
      return;
    }

    // Prevent rapid refetching unless forced
    const now = Date.now();
    const lastFetch = lastFetchTime.current;
    if (!forceRefresh && lastFetch && now - lastFetch < 3000) {
      console.log("Throttling subscription fetch - last fetch too recent");
      return;
    }

    console.log("Fetching subscription data for user:", user.id);
    try {
      setLoading(true);

      // First, get the stripe_customer_id from the profile
      const supabase = createClient();
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, stripe_customer_id, subscribed_to, price_id")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        setSubscriptionData({
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
        setLoading(false);
        return;
      }

      // Store the updated profile info - this is important for fresh subscription data
      if (profile && user) {
        console.log("Subscription check: profile data:", {
          subscribed_to: profile.subscribed_to,
          price_id: profile.price_id,
          stripe_customer_id: profile.stripe_customer_id,
        });

        // If profile shows a subscription but we don't see it in Stripe yet,
        // we can rely on the profile data
        if (profile.subscribed_to && profile.subscribed_to !== "tanad_free") {
          console.log("Profile indicates active subscription:", profile.subscribed_to);

          // Just use the profile data if it's clearly showing a subscription
          setSubscriptionData({
            id: "profile-based",
            name: getNameFromLookupKey(profile.subscribed_to),
            price: getPriceFromLookupKey(profile.subscribed_to),
            billingCycle: "month",
            nextBillingDate: "-",
            planLookupKey: profile.subscribed_to,
            status: "active", // Assume active if in profile
            isExpired: false,
            cancelAt: null,
          });
          setLoading(false);
          return;
        }
      }

      // Check if we have a customer ID to query
      if (!profile?.stripe_customer_id) {
        console.log("No Stripe customer ID in profile, using free plan");
        setSubscriptionData({
          id: null,
          name: t("Billing.free_plan", { fallback: "Free Plan" }),
          price: "0 SAR",
          billingCycle: "-",
          nextBillingDate: "-",
          planLookupKey: "tanad_free",
          status: "active",
          isExpired: false,
          cancelAt: null,
        });
        setLoading(false);
        return;
      }

      const stripeCustomerId = profile.stripe_customer_id;

      try {
        // Get the subscription data from Stripe
        const stripeResponse = await fetch(
          `/api/stripe/get-subscription?customerId=${stripeCustomerId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!stripeResponse.ok) {
          throw new Error("Failed to fetch subscription");
        }

        const stripeData = await stripeResponse.json();

        // Use the new subscription_info field for faster access to key data
        if (stripeData.subscription_info) {
          const subInfo = stripeData.subscription_info;

          // If we have an active subscription from Stripe
          if (subInfo.id) {
            const subscription = stripeData.subscription;

            // Get the price details from the subscription
            const price = subscription.plan?.amount
              ? `${(subscription.plan.amount / 100).toFixed(2)} ${subscription.plan.currency.toUpperCase()}`
              : "0 SAR";

            // Use the most reliable source for lookup key in this order:
            // 1. Profile's subscribed_to from database
            // 2. Lookup key from Stripe price
            // 3. Default to free plan
            const planLookupKey = subInfo.subscribed_to || subInfo.lookup_key || "tanad_free";

            setSubscriptionData({
              id: subInfo.id,
              status: subInfo.status,
              name: getNameFromLookupKey(planLookupKey),
              price,
              planLookupKey,
              billingCycle: subscription.plan?.interval || "month",
              cancelAt: subscription.cancel_at || null,
              nextBillingDate: convertTimestampToDate(subscription.current_period_end),
              isExpired: subInfo.status === "canceled" || subInfo.status === "incomplete_expired",
            });
          }
          // If we only have profile data (no active Stripe subscription)
          else if (subInfo.subscribed_to && subInfo.subscribed_to !== "tanad_free") {
            setSubscriptionData({
              id: null,
              name: getNameFromLookupKey(subInfo.subscribed_to),
              price: getPriceFromLookupKey(subInfo.subscribed_to),
              billingCycle: "month",
              nextBillingDate: "-",
              planLookupKey: subInfo.subscribed_to,
              status: "active",
              isExpired: false,
              cancelAt: null,
            });
          } else {
            // Default to free plan if no subscription detected
            setSubscriptionData({
              id: null,
              name: t("Billing.free_plan", { fallback: "Free Plan" }),
              price: "0 SAR",
              billingCycle: "-",
              nextBillingDate: "-",
              planLookupKey: "tanad_free",
              status: "active",
              isExpired: false,
              cancelAt: null,
            });
          }
        }
        // Fallback to old method if subscription_info is not available
        else if (stripeData.subscription) {
          const subscription = stripeData.subscription;

          console.log("Received stripe subscription data:", {
            id: subscription.id,
            status: subscription.status,
            plan: subscription.plan?.nickname || "Unknown",
            lookupKey: subscription.plan?.lookup_key,
          });

          // Get the price details from the subscription
          const price = subscription.plan?.amount
            ? `${(subscription.plan.amount / 100).toFixed(2)} ${subscription.plan.currency.toUpperCase()}`
            : "0 SAR";

          // Use profile's subscribed_to value if available
          const planLookupKey =
            profile.subscribed_to || subscription.plan?.lookup_key || "tanad_free";

          setSubscriptionData({
            id: subscription.id,
            status: subscription.status,
            name: getNameFromLookupKey(planLookupKey),
            price,
            planLookupKey,
            billingCycle: subscription.plan?.interval || "month",
            cancelAt: subscription.cancel_at || null,
            nextBillingDate: convertTimestampToDate(subscription.current_period_end),
            isExpired:
              subscription.status === "canceled" || subscription.status === "incomplete_expired",
          });
        } else {
          // Use profile data as fallback
          if (profile.subscribed_to && profile.subscribed_to !== "tanad_free") {
            setSubscriptionData({
              id: null,
              name: getNameFromLookupKey(profile.subscribed_to),
              price: getPriceFromLookupKey(profile.subscribed_to),
              billingCycle: "month",
              nextBillingDate: "-",
              planLookupKey: profile.subscribed_to,
              status: "active",
              isExpired: false,
              cancelAt: null,
            });
          } else {
            // Default to free plan if no subscription detected
            setSubscriptionData({
              id: null,
              name: t("Billing.free_plan", { fallback: "Free Plan" }),
              price: "0 SAR",
              billingCycle: "-",
              nextBillingDate: "-",
              planLookupKey: "tanad_free",
              status: "active",
              isExpired: false,
              cancelAt: null,
            });
          }
        }
      } catch (error) {
        console.error("Stripe fetch error:", error);

        // Fallback to profile data if available
        if (profile.subscribed_to && profile.subscribed_to !== "tanad_free") {
          setSubscriptionData({
            id: null,
            name: getNameFromLookupKey(profile.subscribed_to),
            price: getPriceFromLookupKey(profile.subscribed_to),
            billingCycle: "month",
            nextBillingDate: "-",
            planLookupKey: profile.subscribed_to,
            status: "active",
            isExpired: false,
            cancelAt: null,
          });
        } else {
          setSubscriptionData({
            id: null,
            name: t("Billing.free_plan", { fallback: "Free Plan" }),
            price: "0 SAR",
            billingCycle: "-",
            nextBillingDate: "-",
            planLookupKey: "tanad_free",
            status: "active",
            isExpired: false,
            cancelAt: null,
          });
        }
      }
    } catch (error) {
      console.error("Subscription fetch error:", error);
      setSubscriptionData({
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
    } finally {
      setLoading(false);
      lastFetchTime.current = Date.now();
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

    // Skip if initial load was already done
    if (initialLoadDone.current) {
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
      initialLoadDone.current = true;
      return;
    }

    // At this point, we're ready to fetch and haven't done so yet
    console.log(`[${fetchId}] Initial subscription fetch starting`);

    // Mark as initialized immediately to prevent duplicate executions
    window.subscriptionInitialized = true;
    initialLoadDone.current = true;

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
   * Force a refresh of the subscription data
   */
  const refetch = async (forceRefresh = true) => {
    console.log("Forcing subscription refresh");
    return fetchSubscription(forceRefresh);
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

  // Expose the API
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
