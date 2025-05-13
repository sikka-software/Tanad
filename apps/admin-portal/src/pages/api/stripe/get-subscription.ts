import type { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/component";

import { getStripeInstance } from "@/lib/stripe-admin";

/**
 * API endpoint to get a customer's subscription details
 * @param {string} customerId - The Stripe customer ID
 * @returns {Object} The subscription details
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get the customer ID from the query
  const { customerId, includeInactive } = req.query;

  if (!customerId) {
    return res.status(400).json({ error: "Customer ID is required" });
  }

  try {
    // Fetch the user by the stripe_customer_id first - this is faster
    const supabase = createClient();
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*, cancel_at_period_end, cancel_at")
      .eq("stripe_customer_id", customerId)
      .limit(1);

    const profile = profiles && profiles.length > 0 ? profiles[0] : null;

    // Initialize Stripe
    const stripe = getStripeInstance();

    // Determine status to query - include inactive/canceled subscriptions if requested
    const status = includeInactive === "true" ? "all" : "active";

    // Get the customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId as string,
      status,
      limit: 5, // Increase limit to find recently canceled subscriptions
      expand: ["data.default_payment_method", "data.plan"],
    });

    // Check if subscription exists and get the first one
    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];

      // Determine the most accurate cancel_at value (prioritize Stripe over profile)
      const cancelAt = subscription.cancel_at || profile?.cancel_at || null;
      const cancelAtPeriodEnd =
        subscription.cancel_at_period_end || profile?.cancel_at_period_end || false;

      // Check if the subscription is in the final billing period
      const now = Math.floor(Date.now() / 1000);
      const currentPeriodEnd = (subscription as any).current_period_end;
      const isInFinalBillingPeriod =
        cancelAtPeriodEnd || (cancelAt && cancelAt > now && cancelAt <= currentPeriodEnd);

      // Determine display status for UI - correctly handle canceling vs canceled
      const displayStatus =
        subscription.status === "active" && (cancelAtPeriodEnd || cancelAt)
          ? "canceling"
          : cancelAt && now > cancelAt
            ? "canceled"
            : subscription.status;

      // Log important dates for debugging
      console.log("Subscription cancel dates check:", {
        cancelAt: cancelAt ? new Date(cancelAt * 1000).toISOString() : null,
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
        now: new Date(now * 1000).toISOString(),
        isInFinalBillingPeriod,
        actualStatus: subscription.status,
        displayStatus,
      });

      return res.status(200).json({
        subscription,
        profile,
        subscription_info: {
          id: subscription.id,
          status: subscription.status,
          status_display: displayStatus,
          lookup_key: subscription.items?.data[0]?.price?.lookup_key,
          price_id: subscription.items?.data[0]?.price?.id,
          subscribed_to: profile?.subscribed_to || null,
          cancel_at_period_end: cancelAtPeriodEnd,
          cancel_at: cancelAt,
          is_in_final_billing_period: isInFinalBillingPeriod,
          current_period_end: currentPeriodEnd,
        },
      });
    }

    // If no subscription is found, return profile info
    if (profile) {
      return res.status(200).json({
        subscription: null,
        profile,
        subscription_info: {
          id: null,
          status: null,
          status_display: null,
          lookup_key: null,
          price_id: profile.price_id || null,
          subscribed_to: profile.subscribed_to || null,
          cancel_at_period_end: profile.cancel_at_period_end || false,
          cancel_at: profile.cancel_at || null,
          is_in_final_billing_period: profile.cancel_at_period_end || false,
          current_period_end: null,
        },
      });
    }

    // No subscription or profile found
    return res.status(200).json({
      subscription: null,
      profile: null,
      subscription_info: {
        id: null,
        status: null,
        status_display: null,
        lookup_key: null,
        price_id: null,
        subscribed_to: null,
        cancel_at_period_end: false,
        cancel_at: null,
        is_in_final_billing_period: false,
        current_period_end: null,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return res.status(500).json({ error: "Failed to fetch subscription" });
  }
}
