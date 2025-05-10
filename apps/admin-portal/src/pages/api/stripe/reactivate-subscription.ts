import type { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/component";

import { getStripeInstance } from "@/lib/stripe-admin";

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_REACTIVATIONS = 1; // Max 1 reactivation per day

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the subscription ID from the request body
    const { subscriptionId, userId, customerId } = req.body;

    if (!subscriptionId && !userId) {
      return res.status(400).json({ error: "Either Subscription ID or User ID is required" });
    }

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    // Create Supabase client
    const supabase = createClient();

    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      return res.status(404).json({ error: "User not found", details: userError.message });
    }

    // Special case for profile-based subscriptions
    if (subscriptionId === "profile-based") {
      // For profile-based subscriptions, we just update the cancel flags in the database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          cancel_at_period_end: false,
          cancel_at: null,
        })
        .eq("id", userId);

      if (updateError) {
        return res.status(500).json({
          error: "Failed to reactivate profile-based subscription",
          details: updateError.message,
        });
      }

      // Log the reactivation
      await supabase.from("subscription_reactivations").insert({
        user_id: userId,
        subscription_id: "profile-based",
        created_at: new Date().toISOString(),
      });

      // Return success
      return res.status(200).json({
        success: true,
        subscription: {
          id: "profile-based",
          status: "active",
          cancel_at_period_end: false,
          cancel_at: null,
        },
      });
    }

    // Check rate limiting
    const { data: reactivationHistory, error: historyError } = await supabase
      .from("subscription_reactivations")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString())
      .order("created_at", { ascending: false });

    if (historyError) {
      console.error("Error checking reactivation history:", historyError);
      return res.status(500).json({ error: "Failed to check reactivation history" });
    }

    // Check if user has reached the reactivation limit
    if (reactivationHistory && reactivationHistory.length >= MAX_REACTIVATIONS) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        message: "You can only reactivate your subscription once per day",
      });
    }

    // Initialize Stripe
    const stripe = getStripeInstance();

    // Get the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Check if subscription belongs to this user
    if (typeof subscription.customer === "string" && subscription.customer !== customerId) {
      return res.status(403).json({ error: "Subscription does not belong to this user" });
    }

    // Check if subscription is either actually canceling (has cancel_at set) or is already canceled
    if (!subscription.cancel_at && subscription.status !== "canceled") {
      return res
        .status(400)
        .json({ error: "Subscription is not scheduled for cancellation or already canceled" });
    }

    // Reactivate the subscription - handle both cases
    let updatedSubscription;
    if (subscription.status === "canceled") {
      // For actually canceled subscriptions, create a new subscription with the same price
      const items = subscription.items.data.map((item) => ({
        price: item.price.id,
        quantity: item.quantity,
      }));

      updatedSubscription = await stripe.subscriptions.create({
        customer: customerId,
        items,
        metadata: subscription.metadata,
      });
    } else {
      // For subscriptions scheduled for cancellation, just remove the cancel_at_period_end flag
      updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });
    }

    // Log the reactivation
    await supabase.from("subscription_reactivations").insert({
      user_id: user.id,
      subscription_id: subscriptionId,
      created_at: new Date().toISOString(),
    });

    // Return success
    return res.status(200).json({
      success: true,
      subscription: updatedSubscription,
    });
  } catch (error: any) {
    console.error("Error reactivating subscription:", error);
    return res.status(500).json({
      error: "Failed to reactivate subscription",
      details: error.message,
    });
  }
}
