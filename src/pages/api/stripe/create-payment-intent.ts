import { NextApiRequest, NextApiResponse } from "next";

import { getStripeInstance } from "@/lib/stripe-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { priceId, customerId } = req.body;

    // More detailed validation with specific error messages
    if (!priceId) {
      return res.status(400).json({
        error: "Missing required parameter: priceId",
        message: "Price ID is required to create a payment intent",
      });
    }

    if (!customerId) {
      return res.status(400).json({
        error: "Missing required parameter: customerId",
        message: "Customer ID is required to create a payment intent",
      });
    }

    const stripe = getStripeInstance();

    try {
      // Get the price to get the amount
      const price = await stripe.prices.retrieve(priceId);

      if (!price.unit_amount) {
        return res.status(400).json({
          error: "Invalid price: missing unit amount",
          message: `The price with ID ${priceId} doesn't have a unit amount`,
        });
      }

      // Create a PaymentIntent instead of SetupIntent to get card details and charge in one step
      const paymentIntent = await stripe.paymentIntents.create({
        amount: price.unit_amount,
        currency: price.currency,
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          priceId,
        },
        description: `Subscription to ${price.nickname || "plan"}`,
      });

      return res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        customerId,
        priceId,
        amount: price.unit_amount,
        currency: price.currency,
      });
    } catch (stripeError: any) {
      console.error("Stripe API error:", stripeError);
      return res.status(400).json({
        error: "Stripe API error",
        message: stripeError.message || "Error processing request with Stripe",
      });
    }
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return res.status(500).json({
      error: "Failed to create payment intent",
      message: error.message || "An unexpected error occurred",
    });
  }
}
