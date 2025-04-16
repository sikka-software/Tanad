import { NextApiRequest, NextApiResponse } from "next";

import { getStripeInstance } from "@/lib/stripe-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({
        error: "Customer ID is required",
      });
    }

    const stripe = await getStripeInstance();

    // Validate the customer exists
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer || (customer as any).deleted) {
        return res.status(400).json({
          error: "Invalid customer ID",
        });
      }
    } catch (error) {
      console.error("Error retrieving customer:", error);
      return res.status(400).json({
        error: "Failed to verify customer",
      });
    }

    console.log(`Creating setup intent for customer: ${customerId}`);

    // Create a SetupIntent (for saving card)
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session", // Important: Allows the payment method to be used for future payments
    });

    // Validate the setup intent
    if (!setupIntent || !setupIntent.client_secret) {
      throw new Error("Failed to create setup intent");
    }

    console.log(`Setup intent created: ${setupIntent.id}`);

    return res.status(200).json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      customerId,
      status: setupIntent.status,
    });
  } catch (error) {
    console.error("Error creating setup intent:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create setup intent",
    });
  }
}
