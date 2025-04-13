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
    const { priceId, customerId, userId, returnUrl } = req.body;

    if (!priceId || !customerId || !userId) {
      return res.status(400).json({
        error: "Price ID, Customer ID, and User ID are required",
      });
    }

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    // Update user profile in Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        price_id: priceId,
        subscribed_to: subscription.id,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user profile:", updateError);
    }

    // Get the client secret for the payment
    let clientSecret = null;
    if (subscription.latest_invoice && typeof subscription.latest_invoice !== "string") {
      const invoice = subscription.latest_invoice as any;
      if (invoice.payment_intent && typeof invoice.payment_intent !== "string") {
        clientSecret = invoice.payment_intent.client_secret;
      }
    }

    return res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret,
      status: subscription.status,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return res.status(500).json({
      error: "Failed to create subscription",
    });
  }
}
