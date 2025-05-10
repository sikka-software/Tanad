import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

import { getStripeInstance } from "@/lib/stripe-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stripe = getStripeInstance();
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    // Get all subscriptions for the customer
    // Limit expansion to 2 levels to avoid Stripe's 4-level limit
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      expand: ["data.default_payment_method", "data.items.data.price"],
    });

    // Get the most recent active subscription
    const activeSubscription = subscriptions.data.find(
      (sub) => sub.status === "active" || sub.status === "trialing",
    );

    // If there's no active subscription, get the most recent one of any status
    const latestSubscription =
      activeSubscription || (subscriptions.data.length > 0 ? subscriptions.data[0] : null);

    // If we have a subscription, fetch the product details separately
    if (latestSubscription) {
      // Get the price ID from the subscription
      const priceId = latestSubscription.items.data[0].price.id;

      // Fetch price with expanded product
      const price = await stripe.prices.retrieve(priceId, {
        expand: ["product"],
      });

      // Replace the price in the subscription with our newly fetched one that has the product
      if (
        latestSubscription.items.data[0].price &&
        typeof latestSubscription.items.data[0].price !== "string"
      ) {
        latestSubscription.items.data[0].price.product = price.product;
        // Also add the lookup_key if it's available
        latestSubscription.items.data[0].price.lookup_key = price.lookup_key;

        // If lookup_key is not available in price, try to get it from product metadata
        if (!price.lookup_key && price.product && typeof price.product !== "string") {
          const product = price.product as Stripe.Product;
          if (product.metadata?.lookup_key) {
            latestSubscription.items.data[0].price.lookup_key = product.metadata.lookup_key;
          }
        }
      }

      // Add the lookup_key to the subscription plan object if it exists
      const subscriptionWithPlan = latestSubscription as any;
      if (subscriptionWithPlan.plan) {
        subscriptionWithPlan.plan.lookup_key =
          price.lookup_key ||
          (price.product && typeof price.product !== "string"
            ? (price.product as Stripe.Product).metadata?.lookup_key
            : null);
      }
    }
    return res.status(200).json({
      subscription: latestSubscription,
    });
  } catch (error: any) {
    console.error("Error fetching subscription:", error);

    // Include more detailed error information
    const errorMessage = error.message || "Unknown error";
    const errorCode = error.code || "unknown_error";
    const stripeError = error.type
      ? {
          type: error.type,
          code: error.code,
          param: error.param,
          detail: error.detail,
        }
      : null;

    return res.status(500).json({
      error: "Failed to fetch subscription details",
      message: errorMessage,
      code: errorCode,
      stripeError: stripeError,
    });
  }
}
