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
  const { customerId } = req.query;

  if (!customerId) {
    return res.status(400).json({ error: "Customer ID is required" });
  }

  try {
    // Initialize Stripe
    const stripe = getStripeInstance();

    // Get the customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId as string,
      status: "all",
      limit: 1,
      expand: ["data.default_payment_method", "data.plan"],
    });

    // Check if subscription exists and get the first one
    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];

      // Fetch the user by the stripe_customer_id
      const supabase = createClient();
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .eq("stripe_customer_id", customerId)
        .limit(1);

      const profile = profiles && profiles.length > 0 ? profiles[0] : null;

      // Log what we found for debugging
      console.log(`Found subscription for ${customerId}:`, {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan?.nickname || subscription.items?.data[0]?.price?.nickname,
        lookup_key: subscription.plan?.lookup_key || subscription.items?.data[0]?.price?.lookup_key,
        profile_subscribed_to: profile?.subscribed_to,
      });

      return res.status(200).json({
        subscription,
        profile,
      });
    }

    // If no subscription is found, try to get the profile info
    const supabase = createClient();
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .eq("stripe_customer_id", customerId)
      .limit(1);

    if (profiles && profiles.length > 0) {
      console.log(`No subscription found, but profile exists for ${customerId}:`, {
        subscribed_to: profiles[0].subscribed_to,
      });
      return res.status(200).json({
        subscription: null,
        profile: profiles[0],
      });
    }

    // No subscription or profile found
    return res.status(200).json({
      subscription: null,
      profile: null,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return res.status(500).json({ error: "Failed to fetch subscription" });
  }
}
