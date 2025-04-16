import type { NextApiRequest, NextApiResponse } from "next";

import Stripe from "stripe";

import { getStripeInstance } from "@/lib/stripe-admin";
import { supabase } from "@/lib/supabase";

/**
 * API endpoint to create or update a subscription
 *
 * This endpoint handles creating new subscriptions or updating existing ones.
 * It supports direct payment method attachment for subscription creation.
 *
 * @param req.body.priceId - The Stripe price ID for the subscription
 * @param req.body.userId - The user ID in the database
 * @param req.body.customerId - The Stripe customer ID (optional if userId is provided)
 * @param req.body.paymentMethodId - The Stripe payment method ID
 *
 * @returns {Object} Response object with subscription details
 * @returns {string} response.subscriptionId - The ID of the created subscription
 * @returns {string} response.status - The status of the subscription
 * @returns {boolean} response.success - Whether the operation was successful
 * @returns {string|null} response.clientSecret - Client secret for payment if needed
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stripe = getStripeInstance();
    const { priceId, customerId, userId, paymentMethodId } = req.body;

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
    let userProfile = null;

    if (
      userId &&
      (!customerIdToUse || customerIdToUse === "null" || customerIdToUse === "undefined")
    ) {
      console.log(`No valid customer ID provided, looking up by user ID: ${userId}`);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("stripe_customer_id, email, full_name, language, subscribed_to")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error finding user profile:", profileError);
        return res.status(404).json({
          error: "User not found",
          message: "Could not find user profile",
        });
      }

      userProfile = profile;
      console.log("Found user profile:", userProfile);

      if (profile?.stripe_customer_id) {
        console.log(`Found existing stripe customer ID: ${profile.stripe_customer_id}`);
        customerIdToUse = profile.stripe_customer_id;
      } else {
        // Create a new customer if one doesn't exist
        console.log("No stripe customer ID found, creating new customer");
        const customer = await stripe.customers.create({
          email: profile?.email || undefined,
          name: profile?.full_name || undefined,
          metadata: {
            userId: userId,
          },
        });
        customerIdToUse = customer.id;
        console.log(`Created new stripe customer: ${customerIdToUse}`);

        // Update user with stripe customer id
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ stripe_customer_id: customerIdToUse })
          .eq("id", userId);

        if (updateError) {
          console.error("Error updating profile with customer ID:", updateError);
        } else {
          console.log(`Updated user profile with stripe customer ID: ${customerIdToUse}`);
        }
      }
    }

    if (!customerIdToUse) {
      return res.status(400).json({
        error: "Customer ID required",
        message: "Failed to obtain valid customer ID for subscription",
      });
    }

    // Get the lookup key for this price ID
    let lookupKey = await getPlanIdForPriceId(stripe, priceId);
    console.log("Creating subscription for plan:", lookupKey);

    // For free plan, just update the user's subscription status without creating a Stripe subscription
    if (lookupKey === "tanad_free") {
      if (userId) {
        await supabase
          .from("profiles")
          .update({
            subscribed_to: lookupKey,
            price_id: null,
          })
          .eq("id", userId);
        console.log(`Updated user ${userId} to free plan`);
      }
      return res.status(200).json({
        success: true,
        status: "active",
        isActive: true,
      });
    }

    // If payment method is provided, attach it to the customer
    if (paymentMethodId) {
      try {
        // First check if payment method exists
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

        if (!paymentMethod) {
          return res.status(400).json({ error: "Invalid payment method" });
        }

        // Attach payment method to customer if not already attached
        try {
          await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerIdToUse,
          });
          console.log(`Payment method ${paymentMethodId} attached to customer ${customerIdToUse}`);
        } catch (error: any) {
          // Ignore if payment method is already attached
          if (error.code !== "payment_method_already_attached") {
            console.error("Error attaching payment method:", error);
            return res.status(400).json({
              error: "Failed to attach payment method",
              message: error.message,
            });
          } else {
            console.log(
              `Payment method ${paymentMethodId} already attached to customer ${customerIdToUse}`,
            );
          }
        }

        // Set as default payment method
        await stripe.customers.update(customerIdToUse, {
          invoice_settings: { default_payment_method: paymentMethodId },
        });
      } catch (error: any) {
        console.error("Error processing payment method:", error);
        return res.status(400).json({
          error: "Failed to process payment method",
          message: error.message || "An error occurred while processing the payment method",
        });
      }
    }

    // Check if the user already has an active subscription
    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customerIdToUse,
      status: "active",
      limit: 1,
    });

    let subscription;
    let status;
    let clientSecret = null;

    // If there is an existing subscription, update it
    if (subscriptions && subscriptions.length > 0) {
      const existingSubscription = subscriptions[0] as Stripe.Subscription;

      const subscriptionUpdateParams: Stripe.SubscriptionUpdateParams = {
        items: [
          {
            id: (existingSubscription.items as any).data[0].id,
            price: priceId,
          },
        ],
        proration_behavior: "always_invoice",
      };

      if (paymentMethodId) {
        subscriptionUpdateParams.default_payment_method = paymentMethodId;
      }

      // Expand latest_invoice and payment_intent to get client_secret if needed
      subscriptionUpdateParams.expand = ["latest_invoice.payment_intent"];

      subscription = await stripe.subscriptions.update(
        existingSubscription.id,
        subscriptionUpdateParams,
      );

      status = subscription.status;

      // Get client secret from payment intent if available and needed
      const invoice = subscription.latest_invoice as Stripe.Invoice & {
        payment_intent?: Stripe.PaymentIntent;
      };

      if (invoice?.payment_intent && typeof invoice.payment_intent !== "string") {
        clientSecret = invoice.payment_intent.client_secret;
      }
    } else {
      // Create a new subscription
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: customerIdToUse,
        items: [{ price: priceId }],
        expand: ["latest_invoice.payment_intent"],
        metadata: {
          userId,
          language: userProfile?.language || "en",
        },
      };

      if (paymentMethodId) {
        subscriptionParams.default_payment_method = paymentMethodId;
      }

      subscription = await stripe.subscriptions.create(subscriptionParams);
      status = subscription.status;

      // Get client secret from payment intent if available
      const invoice = subscription.latest_invoice as Stripe.Invoice & {
        payment_intent?: Stripe.PaymentIntent;
      };

      if (invoice?.payment_intent && typeof invoice.payment_intent !== "string") {
        clientSecret = invoice.payment_intent.client_secret;
      }
    }

    // Update user's subscription status in our database
    if (userId) {
      await supabase
        .from("profiles")
        .update({
          subscribed_to: lookupKey,
          price_id: priceId,
        })
        .eq("id", userId);
      console.log(`Updated user ${userId} subscription to plan ${lookupKey}`);
    }

    // Check if the subscription requires additional payment or action
    if (status === "incomplete" && clientSecret) {
      return res.status(200).json({
        subscriptionId: subscription.id,
        status,
        success: false,
        clientSecret,
        requires_payment: true,
      });
    }

    const isActive = status === "active" || status === "trialing";

    return res.status(200).json({
      subscriptionId: subscription.id,
      status,
      success: true,
      isActive,
      clientSecret: null,
    });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    return res.status(500).json({
      error: "Failed to create subscription",
      message: error.message || "An unexpected error occurred",
    });
  }
}

/**
 * Helper function to get the plan lookup key from a price ID
 */
async function getPlanIdForPriceId(stripe: Stripe, priceId: string) {
  try {
    // If the priceId is already a lookup key, return it
    if (priceId.startsWith("tanad_")) {
      return priceId;
    }

    // Otherwise, retrieve the price and get the lookup key from it
    const price = await stripe.prices.retrieve(priceId);
    if (price.product && typeof price.product === "string") {
      const product = await stripe.products.retrieve(price.product);
      return product.metadata?.lookup_key || "tanad_free";
    }

    return "tanad_free";
  } catch (error) {
    console.error("Error getting plan ID for price:", error);
    return "tanad_free";
  }
}
