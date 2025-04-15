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
    const { priceId, customerId, userId, paymentMethodId, paymentIntentId } = req.body;

    if (!priceId) {
      return res.status(400).json({
        error: "Missing required parameter: priceId",
        message: "Price ID is required to create a subscription",
      });
    }

    // Either need a customer ID or user ID
    if (!customerId && !userId) {
      return res.status(400).json({
        error: "Missing required parameters",
        message: "Either Customer ID or User ID is required",
      });
    }

    // Get customer info if we have userId but no customerId
    let customerIdToUse = customerId;
    if (!customerIdToUse && userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", userId)
        .single();

      if (profile?.stripe_customer_id) {
        customerIdToUse = profile.stripe_customer_id;
      } else {
        return res.status(400).json({
          error: "No Stripe customer found",
          message: "User does not have a Stripe customer ID",
        });
      }
    }

    // Create subscription params
    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: customerIdToUse,
      items: [{ price: priceId }],
      expand: ["latest_invoice.payment_intent"],
    };

    // If we have a payment method ID, use it
    if (paymentMethodId) {
      subscriptionParams.default_payment_method = paymentMethodId;
    }

    // Create subscription with complete status if we have payment
    if (paymentMethodId || paymentIntentId) {
      // If we have a payment method or intent, we want to create a complete subscription
      subscriptionParams.payment_behavior = "default_incomplete";
      subscriptionParams.payment_settings = {
        save_default_payment_method: "on_subscription",
        payment_method_types: ["card"],
      };
    } else {
      // Otherwise create an incomplete subscription that will require payment
      subscriptionParams.payment_behavior = "default_incomplete";
      subscriptionParams.payment_settings = {
        save_default_payment_method: "on_subscription",
      };
    }

    // Create the subscription
    const subscription = await stripe.subscriptions.create(subscriptionParams);

    // Determine the status and client secret
    let clientSecret = null;
    let status = subscription.status;

    // Extract client secret if available
    if (subscription.latest_invoice && typeof subscription.latest_invoice !== "string") {
      const invoice = subscription.latest_invoice as Stripe.Invoice & {
        payment_intent?: string | Stripe.PaymentIntent;
      };

      if (invoice.payment_intent && typeof invoice.payment_intent !== "string") {
        clientSecret = invoice.payment_intent.client_secret;
      }
    }

    // If we have a confirmed payment intent ID, we need to attach it to the subscription
    // This typically happens when payment is confirmed before subscription creation
    if (paymentIntentId && status === "incomplete") {
      try {
        // Get the payment intent to verify its status
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === "succeeded") {
          // The payment is already successful, so we can update the subscription
          await stripe.subscriptions.update(subscription.id, {
            default_payment_method: paymentIntent.payment_method as string,
          });

          // Simulate the webhook event that would mark the subscription as active
          const updatedSubscription = await stripe.subscriptions.retrieve(subscription.id);
          status = updatedSubscription.status;
        }
      } catch (error) {
        console.error("Error processing payment intent for subscription:", error);
      }
    }

    // Update user profile in Supabase if subscription is active
    if (userId && (status === "active" || status === "trialing")) {
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
    }

    return res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret,
      status,
      isActive: status === "active" || status === "trialing",
    });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    return res.status(500).json({
      error: "Failed to create subscription",
      message: error.message || "Unknown error",
    });
  }
}
