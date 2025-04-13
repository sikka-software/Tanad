import type { NextApiRequest, NextApiResponse } from "next";

import Stripe from "stripe";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    // Get all subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      expand: ["data.default_payment_method", "data.items.data.price.product"],
    });

    // Get the most recent active subscription
    const activeSubscription = subscriptions.data.find(
      (sub) => sub.status === "active" || sub.status === "trialing",
    );

    // If there's no active subscription, get the most recent one of any status
    const latestSubscription =
      activeSubscription || (subscriptions.data.length > 0 ? subscriptions.data[0] : null);

    return res.status(200).json({
      subscription: latestSubscription,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return res.status(500).json({ error: "Failed to fetch subscription details" });
  }
}
