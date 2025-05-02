import { NextApiRequest, NextApiResponse } from "next";

import { getStripeInstance } from "@/lib/stripe-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }
    const stripe = getStripeInstance();

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    return res.status(200).json({ paymentMethods: paymentMethods.data });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
