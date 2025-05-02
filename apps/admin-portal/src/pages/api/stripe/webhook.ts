import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

import { createClient } from "@/utils/supabase/component";

import { sendEmailViaWebhook } from "@/lib/email!";
import { getStripeInstance } from "@/lib/stripe-admin";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: NextApiRequest) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const relevantEvents = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const supabase = createClient();
  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"]!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeInstance();
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(
      `⚠️ Webhook signature verification failed:`,
      err instanceof Error ? err.message : "Unknown error",
    );
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  // Only process relevant events
  if (!relevantEvents.has(event.type)) {
    return res.status(200).json({ message: `Ignored event type ${event.type}` });
  }

  try {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0].price.id;

    console.log(`Processing ${event.type}:`, {
      customerId,
      priceId,
      status: subscription.status,
    });

    // Get the price details to get the lookup_key
    const stripe = getStripeInstance();
    const customer = await stripe.customers.retrieve(customerId);
    const price = await stripe.prices.retrieve(priceId);

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("stripe_customer_id", customerId)
      .single();

    switch (event.type) {
      case "customer.subscription.created":
        // Update subscription status
        await supabase
          .from("profiles")
          .update({
            subscribed_to: price.lookup_key,
            price_id: priceId,
          })
          .eq("stripe_customer_id", customerId);

        console.log("✓ Created subscription:", {
          customerId,
          subscribed_to: price.lookup_key,
          price_id: priceId,
        });

        // Send activation email
        if (!customer.deleted && customer.email && process.env.SUB_ACTIVATION_WEBHOOK_URL) {
          try {
            await sendEmailViaWebhook(process.env.SUB_ACTIVATION_WEBHOOK_URL, {
              customerId,
              email: customer.email,
              planName: price.lookup_key,
              amount: (price.unit_amount! / 100).toString(),
              currency: price.currency.toUpperCase(),
              billingInterval: `per ${price.recurring?.interval || "month"}`,
              language: subscription.metadata?.language || "ar",
              status: subscription.status,
            });
            console.log("✓ Activation email sent successfully");
          } catch (error) {
            console.error("❌ Failed to send activation email:", error);
          }
        }
        break;

      case "customer.subscription.updated":
        if (subscription.cancel_at && subscription.cancellation_details?.reason) {
          console.log("subscription cancelled");
        } else {
          // Get the price details to get the lookup_key

          await supabase
            .from("profiles")
            .update({
              subscribed_to: price.lookup_key,
              price_id: priceId,
            })
            .eq("stripe_customer_id", customerId);
          try {
            await sendEmailViaWebhook(process.env.SUB_UPDATED_WEBHOOK_URL!, {
              customerId,
              email: profile?.email,
              planName: price.lookup_key,
              amount: (price.unit_amount! / 100).toString(),
              currency: price.currency.toUpperCase(),
              billingInterval: `per ${price.recurring?.interval || "month"}`,
              language: subscription.metadata?.language || "ar",
              status: subscription.status,
            });
            console.log("✓ Updated subscription email sent successfully");
          } catch (error) {
            console.error("❌ Failed to send updated subscription email:", error);
          }
        }

        break;

      case "customer.subscription.deleted":
        // Get the last price details before deletion
        console.log("deleted this subscription", subscription);
        await supabase
          .from("profiles")
          .update({
            subscribed_to: "lazim_free",
            price_id: process.env.FREE_PLAN_ID,
          })
          .eq("stripe_customer_id", customerId);

        console.log("✓ Deleted subscription, reset to free plan:", {
          customerId,
        });
        try {
          await sendEmailViaWebhook(process.env.SUB_EXPIRATION_WEBHOOK_URL!, {
            customerId,
            email: profile?.email,
            planName: price.lookup_key,
            amount: (price.unit_amount! / 100).toString(),
            currency: price.currency.toUpperCase(),
            billingInterval: `per ${price.recurring?.interval || "month"}`,
            language: subscription.metadata?.language || "ar",
          });
          console.log("✓ Expiration email sent successfully");
        } catch (error) {
          console.error("❌ Failed to send expiration email:", error);
        }

        break;
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error processing webhook",
    });
  }
}
