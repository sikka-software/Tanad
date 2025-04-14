import type { NextApiRequest, NextApiResponse } from "next";

import Stripe from "stripe";

import { getStripeInstance } from "@/lib/stripe-admin";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stripe = getStripeInstance();
    const { priceId, customerId, userId } = req.body;

    if (!priceId || !customerId || !userId) {
      return res.status(400).json({
        error: "Price ID, Customer ID, and User ID are required",
      });
    }

    // Create the subscription with limited expansion
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice"],
    });

    // Manually retrieve payment intent if needed
    let clientSecret = null;
    if (subscription.latest_invoice && typeof subscription.latest_invoice !== "string") {
      const invoice = subscription.latest_invoice as Stripe.Invoice & {
        payment_intent?: string | Stripe.PaymentIntent;
      };

      if (invoice.payment_intent && typeof invoice.payment_intent === "string") {
        const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
        clientSecret = paymentIntent.client_secret;
      } else if (invoice.payment_intent && typeof invoice.payment_intent !== "string") {
        clientSecret = invoice.payment_intent.client_secret;
      }
    }

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

    return res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret,
      status: subscription.status,
    });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    return res.status(500).json({
      error: "Failed to create subscription",
      message: error.message || "Unknown error",
    });
  }
}
