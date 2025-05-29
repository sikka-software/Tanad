import Stripe from "stripe";

import { getStripeInstance } from "../src/lib/stripe-admin";

async function cancelSubscriptions() {
  try {
    const stripe = getStripeInstance();

    console.log("Fetching active subscriptions...\n");

    // Get all active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
      expand: ["data.customer"],
    });

    if (subscriptions.data.length === 0) {
      console.log("No active subscriptions found.");
      return;
    }

    console.log(`Found ${subscriptions.data.length} active subscriptions.\n`);

    // Cancel each subscription
    for (const subscription of subscriptions.data) {
      const customer = subscription.customer as Stripe.Customer;
      console.log(`Canceling subscription for customer:`);
      console.log(`  Customer Email: ${customer.email || "No email"}`);
      console.log(`  Subscription ID: ${subscription.id}`);

      try {
        await stripe.subscriptions.cancel(subscription.id, {
          prorate: true,
        });
        console.log("  ✓ Subscription canceled successfully\n");
      } catch (error) {
        console.error(
          `  ✗ Failed to cancel subscription: ${error instanceof Error ? error.message : "Unknown error"}\n`,
        );
      }
    }

    console.log("Finished processing all subscriptions.");
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
}

cancelSubscriptions();
