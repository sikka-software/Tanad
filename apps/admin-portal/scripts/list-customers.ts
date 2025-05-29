import Stripe from "stripe";

import { getStripeInstance } from "../src/lib/stripe-admin";

async function listCustomers() {
  try {
    const stripe = getStripeInstance();

    console.log("Fetching all customers...\n");

    // Get all customers, paginating through the results
    let hasMore = true;
    let startingAfter: string | undefined;
    let customerCount = 0;

    while (hasMore) {
      const customers = await stripe.customers.list({
        limit: 100,
        starting_after: startingAfter,
        expand: ["data.subscriptions"],
      });

      customers.data.forEach((customer) => {
        customerCount++;
        console.log(`Customer #${customerCount}:`);
        console.log(`  ID: ${customer.id}`);
        console.log(`  Email: ${customer.email || "No email"}`);
        console.log(`  Name: ${customer.name || "No name"}`);
        console.log(`  Created: ${new Date(customer.created * 1000).toLocaleString()}`);
        console.log(`  Metadata:`, customer.metadata || "No metadata");

        // Show subscription status if any
        if (customer.subscriptions?.data?.length) {
          const activeSubscriptions = customer.subscriptions.data.filter(
            (sub): sub is Stripe.Subscription =>
              sub.status === "active" || sub.status === "trialing",
          );
          console.log(`  Active Subscriptions: ${activeSubscriptions.length}`);
          activeSubscriptions.forEach((sub) => {
            console.log(
              `    - Plan: ${sub.items.data[0].price.nickname || sub.items.data[0].price.id}`,
            );
            console.log(`    - Status: ${sub.status}`);
          });
        } else {
          console.log("  No active subscriptions");
        }
        console.log(""); // Empty line between customers
      });

      hasMore = customers.has_more;
      startingAfter = customers.data[customers.data.length - 1]?.id;
    }

    console.log(`\nTotal customers found: ${customerCount}`);
  } catch (error) {
    console.error("Error fetching customers:", error);
    process.exit(1);
  }
}

listCustomers();
