import type { NextApiRequest, NextApiResponse } from "next";

import { getStripeInstance } from "@/lib/stripe-admin";

import { createClient } from "@/utils/supabase/component";

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

    // Cancel the subscription
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
          // Optional: Update any profile fields to reflect cancellation
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
