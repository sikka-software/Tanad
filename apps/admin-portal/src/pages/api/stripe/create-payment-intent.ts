import { NextApiRequest, NextApiResponse } from "next";

import { getStripeInstance } from "@/lib/stripe-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { priceId, customerId } = req.body;

    if (!priceId || !customerId) {
      return res.status(400).json({
        error: "Missing required parameters",
      });
    }

    const stripe = getStripeInstance();

    // Get the price to get the amount
    const price = await stripe.prices.retrieve(priceId);

    // Create a SetupIntent (for saving card)
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      metadata: {
        priceId,
      },
    });

    return res.status(200).json({
      clientSecret: setupIntent.client_secret,
      customerId,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create payment intent",
    });
  }
}
