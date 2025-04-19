import { NextApiRequest, NextApiResponse } from "next";

import { getStripeInstance } from "@/lib/stripe-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stripe = await getStripeInstance();
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    // Get invoices for the customer
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10, // Limit to recent 10 invoices
      status: "paid", // Only show paid invoices
    });

    return res.status(200).json({
      invoices: invoices.data,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}
