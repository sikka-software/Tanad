import type { NextApiRequest, NextApiResponse } from "next";

import Stripe from "stripe";

import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { subscriptionId, priceId, userId } = req.body;

    if (!subscriptionId || !priceId || !userId) {
      return res.status(400).json({
        error: "Subscription ID, Price ID, and User ID are required",
      });
    }

    // Get the current subscription
    const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Get the subscription item ID
    const subscriptionItemId = currentSubscription.items.data[0].id;

    // Update the subscription with the new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscriptionItemId,
          price: priceId,
        },
      ],
      proration_behavior: "create_prorations",
    });

    // Update user profile in Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        price_id: priceId,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user profile:", updateError);
    }

    return res.status(200).json({
      subscriptionId: updatedSubscription.id,
      status: updatedSubscription.status,
      message: "Subscription updated successfully",
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return res.status(500).json({
      error: "Failed to update subscription",
    });
  }
}
