import type { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/component";

import { getStripeInstance } from "@/lib/stripe-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const supabase = createClient();
  try {
    const stripe = getStripeInstance();
    const { subscriptionId, userId, cancelAtPeriodEnd = true } = req.body;

    if (!subscriptionId || !userId) {
      return res.status(400).json({
        error: "Subscription ID and User ID are required",
      });
    }

    // Special case for "profile-based" subscriptions (which don't exist in Stripe)
    if (subscriptionId === "profile-based") {
      console.log("Handling profile-based subscription cancellation for user:", userId);

      // Get the user profile to get current subscription details
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, subscribed_to, price_id")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return res.status(500).json({
          error: "Failed to fetch user profile",
        });
      }

      // Set cancellation information in the profile
      const cancelAt = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now in seconds
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          cancel_at_period_end: true,
          cancel_at: cancelAt,
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating user profile:", updateError);
        return res.status(500).json({
          error: "Failed to update user profile",
        });
      }

      return res.status(200).json({
        success: true,
        subscriptionId: "profile-based",
        status: "active", // Keep status as active until period end
        cancelAt: cancelAt,
        message: "Subscription will be canceled at the end of the billing period",
      });
    }

    // Regular Stripe subscription cancellation
    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });

    // If immediate cancellation is requested, we can use this instead:
    // const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);

    // Update user profile in Supabase if needed
    if (cancelAtPeriodEnd) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          cancel_at_period_end: true,
          cancel_at: canceledSubscription.cancel_at || null,
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating user profile:", updateError);
      }
    }

    return res.status(200).json({
      success: true,
      subscriptionId: canceledSubscription.id,
      status: canceledSubscription.status,
      cancelAt: canceledSubscription.cancel_at,
      message: cancelAtPeriodEnd
        ? "Subscription will be canceled at the end of the billing period"
        : "Subscription canceled immediately",
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return res.status(500).json({
      error: "Failed to cancel subscription",
    });
  }
}
