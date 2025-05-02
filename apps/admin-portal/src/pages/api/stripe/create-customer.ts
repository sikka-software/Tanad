import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any, // Cast to any to bypass type checking
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email,
      name: name || email.split("@")[0], // Use name if provided, otherwise use part of email
      metadata: {
        source: "tanad_signup",
      },
    });

    // Return the customer ID
    return res.status(200).json({
      success: true,
      customerId: customer.id,
    });
  } catch (error: any) {
    console.error("Error creating Stripe customer:", error);
    return res.status(500).json({
      error: "Failed to create Stripe customer",
      message: error.message,
    });
  }
}
