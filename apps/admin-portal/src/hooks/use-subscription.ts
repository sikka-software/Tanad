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

// Event name for subscription updates
const SUBSCRIPTION_UPDATED_EVENT = "subscriptionUpdated";

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
    | "canceling"
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
  const initialLoadDone = useRef(false);
  const lastFetchTime = useRef<number | null>(null);

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
        .select("id, stripe_customer_id, subscribed_to, price_id, cancel_at_period_end, cancel_at")
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

      // Check if we've passed the known end date for subscriptions (June 13, 2025)
      const currentDate = new Date();
      const stripeEndDate = new Date("2025-06-13");

      if (currentDate > stripeEndDate) {
        console.log(
          "Current date is past the known subscription end date (June 13, 2025), setting to free plan",
        );
        setSubscriptionData({
          id: null,
          name: t("Billing.free_plan", { fallback: "Free Plan" }),
          price: "0 SAR",
          billingCycle: "-",
          nextBillingDate: "-",
          planLookupKey: "tanad_free",
          status: "canceled",
          isExpired: true,
          cancelAt: null,
        });
        setLoading(false);
        return;
      }

      // Check if profile cancel_at date has passed
      if (profile.cancel_at) {
        const cancelAtDate = new Date(profile.cancel_at * 1000);
        if (currentDate > cancelAtDate) {
          console.log("Profile cancel_at date has passed, setting to free plan", {
            cancelAtDate: cancelAtDate.toISOString(),
            currentDate: currentDate.toISOString(),
          });
          setSubscriptionData({
            id: null,
            name: t("Billing.free_plan", { fallback: "Free Plan" }),
            price: "0 SAR",
            billingCycle: "-",
            nextBillingDate: "-",
            planLookupKey: "tanad_free",
            status: "canceled",
            isExpired: true,
            cancelAt: null,
          });
          setLoading(false);
          return;
        }
      }

      // Store the updated profile info - this is important for fresh subscription data
      if (profile && user) {
        console.log("Subscription check: profile data:", {
          subscribed_to: profile.subscribed_to,
          price_id: profile.price_id,
          stripe_customer_id: profile.stripe_customer_id,
          cancel_at_period_end: profile.cancel_at_period_end,
          cancel_at: profile.cancel_at ? new Date(profile.cancel_at * 1000).toISOString() : null,
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
            status: profile.cancel_at_period_end ? "canceled" : "active",
            isExpired: false,
            cancelAt: profile.cancel_at,
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
          const subscription = stripeData.subscription;

          // Check if we have a valid subscription from Stripe
          if (subscription && subInfo.id) {
            // Get current timestamp in seconds for comparison
            const now = Date.now() / 1000;

            // Check if the subscription has a cancelAt time and if that time has passed
            // Prioritize using the cancel_at from Stripe, with a fallback to profile
            const cancelAt = subscription.cancel_at || subInfo.cancel_at || profile.cancel_at;
            const isExpired =
              subInfo.status === "canceled" ||
              subInfo.status === "incomplete_expired" ||
              (cancelAt && now > cancelAt);

            if (isExpired && cancelAt && now > cancelAt) {
              console.log("Subscription has passed its cancel_at date, treating as expired", {
                cancel_at: new Date(cancelAt * 1000).toISOString(),
                now: new Date(now * 1000).toISOString(),
                diffDays: (now - cancelAt) / (60 * 60 * 24),
              });

              setSubscriptionData({
                id: null,
                name: t("Billing.free_plan", { fallback: "Free Plan" }),
                price: "0 SAR",
                billingCycle: "-",
                nextBillingDate: "-",
                planLookupKey: "tanad_free",
                status: "canceled",
                isExpired: true,
                cancelAt: null,
              });
            } else {
              // Get the price details from the subscription
              const price = subscription.plan?.amount
                ? `${(subscription.plan.amount / 100).toFixed(2)} ${subscription.plan.currency.toUpperCase()}`
                : "0 SAR";

              // Use the best source for the plan lookup key
              const planLookupKey = subInfo.subscribed_to || subInfo.lookup_key || "tanad_free";

              // Check if subscription is in final billing period (has cancel_at set)
              const isCancelingActive =
                subscription.cancel_at_period_end || (cancelAt && cancelAt > now);

              // Set appropriate status for UI
              const displayStatus =
                subInfo.status_display ||
                (subscription.status === "canceled"
                  ? "canceled"
                  : isCancelingActive
                    ? "canceling"
                    : subInfo.status);

              console.log("Subscription status check:", {
                actual_status: subInfo.status,
                display_status: displayStatus,
                api_display_status: subInfo.status_display,
                cancel_at_period_end: subscription.cancel_at_period_end,
                cancel_at: cancelAt ? new Date(cancelAt * 1000).toISOString() : null,
                is_canceling_active: isCancelingActive,
              });

              setSubscriptionData({
                id: subInfo.id,
                status: displayStatus,
                name: getNameFromLookupKey(planLookupKey),
                price,
                planLookupKey,
                billingCycle: subscription.plan?.interval || "month",
                cancelAt: cancelAt, // Use the resolved cancelAt value
                nextBillingDate: convertTimestampToDate(subscription.current_period_end),
                isExpired,
              });
            }
          }
          // Use profile data as fallback if no active Stripe subscription
          else if (subInfo.subscribed_to && subInfo.subscribed_to !== "tanad_free") {
            setSubscriptionData({
              id: null,
              name: getNameFromLookupKey(subInfo.subscribed_to),
              price: getPriceFromLookupKey(subInfo.subscribed_to),
              billingCycle: "month",
              nextBillingDate: "-",
              planLookupKey: subInfo.subscribed_to,
              status: subInfo.cancel_at_period_end ? "canceled" : "active",
              isExpired: false,
              cancelAt: subInfo.cancel_at,
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
            cancel_at: subscription.cancel_at
              ? new Date(subscription.cancel_at * 1000).toISOString()
              : null,
          });

          // Check if subscription has already expired based on cancel_at
          const now = Date.now() / 1000; // Current time in seconds

          // Prioritize Stripe's cancelAt, with fallback to profile
          const cancelAt = subscription.cancel_at || profile.cancel_at;

          const isExpired =
            subscription.status === "canceled" ||
            subscription.status === "incomplete_expired" ||
            (cancelAt && now > cancelAt);

          // If the subscription has expired (cancel_at date has passed), treat as free plan
          if (isExpired && cancelAt && now > cancelAt) {
            console.log(
              "Subscription has passed its cancel_at date (fallback method), treating as expired",
              {
                cancel_at: new Date(cancelAt * 1000).toISOString(),
                now: new Date(now * 1000).toISOString(),
                diffDays: (now - cancelAt) / (60 * 60 * 24),
              },
            );

            setSubscriptionData({
              id: null,
              name: t("Billing.free_plan", { fallback: "Free Plan" }),
              price: "0 SAR",
              billingCycle: "-",
              nextBillingDate: "-",
              planLookupKey: "tanad_free",
              status: "canceled",
              isExpired: true,
              cancelAt: null,
            });
          } else {
            // Get the price details from the subscription
            const price = subscription.plan?.amount
              ? `${(subscription.plan.amount / 100).toFixed(2)} ${subscription.plan.currency.toUpperCase()}`
              : "0 SAR";

            // Use profile's subscribed_to value if available
            const planLookupKey =
              profile.subscribed_to || subscription.plan?.lookup_key || "tanad_free";

            // Check if subscription is in final billing period (has cancel_at set)
            const isCancelingActive =
              subscription.cancel_at_period_end || (cancelAt && cancelAt > now);

            // Set appropriate status for UI - mark as "canceling" if in final period
            // Only mark as "canceled" if the subscription is truly canceled
            // Use the status_display if it came from the API
            const displayStatus =
              stripeData.status_display ||
              (subscription.status === "canceled"
                ? "canceled"
                : isCancelingActive
                  ? "canceling"
                  : subscription.status);

            console.log("Subscription status check:", {
              actual_status: subscription.status,
              display_status: displayStatus,
              api_display_status: stripeData.status_display,
              cancel_at_period_end: subscription.cancel_at_period_end,
              cancel_at: cancelAt ? new Date(cancelAt * 1000).toISOString() : null,
              is_canceling_active: isCancelingActive,
            });

            setSubscriptionData({
              id: subscription.id,
              status: displayStatus, // Use display status instead of actual status
              name: getNameFromLookupKey(planLookupKey),
              price,
              planLookupKey,
              billingCycle: subscription.plan?.interval || "month",
              cancelAt,
              nextBillingDate: convertTimestampToDate(subscription.current_period_end),
              isExpired,
            });
          }
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
              status: profile.cancel_at_period_end ? "canceled" : "active",
              isExpired: false,
              cancelAt: profile.cancel_at,
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
            status: profile.cancel_at_period_end ? "canceled" : "active",
            isExpired: false,
            cancelAt: profile.cancel_at,
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

  // Add visibility change listener to refresh subscription data when tab regains focus
  useEffect(() => {
    const minVisibilityChangeInterval = 30000; // Only refresh if page was hidden for at least 30 seconds
    let lastHiddenTime: number | null = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Page is being hidden (user switched tabs or minimized)
        lastHiddenTime = Date.now();
        console.log("Page hidden, noting timestamp for potential refresh later");
      } else if (document.visibilityState === "visible" && lastHiddenTime) {
        // Page has become visible again after being hidden
        const hiddenDuration = Date.now() - lastHiddenTime;

        // Only refresh if the page was hidden for a significant amount of time
        if (hiddenDuration > minVisibilityChangeInterval && user) {
          console.log(
            `Page visible again after ${hiddenDuration / 1000}s - refreshing subscription data`,
          );
          fetchSubscription(true); // Force refresh
        } else {
          console.log(
            `Page visible again after ${hiddenDuration / 1000}s - not long enough to warrant refresh`,
          );
        }

        lastHiddenTime = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Also handle window focus events similar to visibility changes
    let lastBlurTime: number | null = null;

    const handleWindowBlur = () => {
      lastBlurTime = Date.now();
      console.log("Window lost focus, noting timestamp");
    };

    const handleWindowFocus = () => {
      if (lastBlurTime) {
        const blurDuration = Date.now() - lastBlurTime;

        // Only refresh if the window was blurred for a significant amount of time
        if (blurDuration > minVisibilityChangeInterval && user) {
          console.log(
            `Window regained focus after ${blurDuration / 1000}s - refreshing subscription data`,
          );
          fetchSubscription(true); // Force refresh
        } else {
          console.log(`Window regained focus after ${blurDuration / 1000}s - not refreshing`);
        }

        lastBlurTime = null;
      }
    };

    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [user, fetchSubscription]);

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

  /**
   * Reactivate a canceled subscription
   */
  const reactivateSubscription = async (): Promise<{
    success: boolean;
    subscription?: any;
    error?: string;
  }> => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Check if we have a profile-based subscription
      if (subscriptionData.id === "profile-based") {
        // For profile-based subscriptions, we'll update the profile directly
        const supabase = createClient();
        const { error } = await supabase
          .from("profiles")
          .update({
            cancel_at_period_end: false,
            cancel_at: null,
          })
          .eq("id", user.id);

        if (error) {
          throw new Error("Failed to reactivate profile-based subscription: " + error.message);
        }

        // Refresh user data and subscription data
        await fetchUserAndProfile();
        await fetchSubscription(true);

        return {
          success: true,
        };
      }

      // For already canceled subscriptions, we may not have an ID in the state
      // In that case, we need to try to fetch the latest canceled subscription from the API
      let subscriptionIdToReactivate = subscriptionData.id;

      if (!subscriptionIdToReactivate) {
        // Try to get the most recent canceled subscription from the API
        const response = await fetch("/api/stripe/get-subscription?includeInactive=true", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch canceled subscription");
        }

        const data = await response.json();
        if (data.subscription?.id) {
          subscriptionIdToReactivate = data.subscription.id;
        } else {
          throw new Error("No canceled subscription found to reactivate");
        }
      }

      const response = await fetch("/api/stripe/reactivate-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: subscriptionIdToReactivate,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Failed to reactivate subscription",
        );
      }

      const data = await response.json();

      // Dispatch event to notify subscribers that subscription has been updated
      const event = new CustomEvent(SUBSCRIPTION_UPDATED_EVENT);
      window.dispatchEvent(event);
      window.dispatchEvent(new Event("subscription_updated")); // for backwards compatibility

      // Refresh user data and subscription data
      await fetchUserAndProfile();
      await fetchSubscription(true);

      return {
        success: true,
        subscription: data.subscription,
      };
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      return {
        success: false,
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
    reactivateSubscription,
  };
}
