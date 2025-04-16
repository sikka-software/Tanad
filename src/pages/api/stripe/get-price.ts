import type { NextApiRequest, NextApiResponse } from "next";

import { getStripeInstance } from "@/lib/stripe-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { priceId } = req.query;

    if (!priceId || typeof priceId !== "string") {
      return res.status(400).json({
        error: "Missing required parameter",
        message: "Price ID is required",
      });
    }

    const stripe = getStripeInstance();

    // Get the price details
    const price = await stripe.prices.retrieve(priceId, {
      expand: ["product"],
    });

    // Format the response with relevant details
    const product = price.product as any;
    const name = product?.name || "Subscription";

    // Format the price string
    const amount = price.unit_amount ? price.unit_amount / 100 : 0;
    const currency = price.currency ? price.currency.toUpperCase() : "SAR";
    const interval =
      price.recurring?.interval === "month"
        ? "/month"
        : price.recurring?.interval === "year"
          ? "/year"
          : "";

    const priceStr = `${amount.toFixed(2)} ${currency}${interval}`;

    return res.status(200).json({
      priceId: price.id,
      name,
      price: priceStr,
      currency: price.currency,
      amount: price.unit_amount ? price.unit_amount / 100 : 0,
      interval: price.recurring?.interval || null,
      lookup_key: price.lookup_key || product?.metadata?.lookup_key || null,
    });
  } catch (error: any) {
    console.error("Error fetching price details:", error);
    return res.status(500).json({
      error: "Failed to fetch price details",
      message: error.message || "An unexpected error occurred",
    });
  }
}
