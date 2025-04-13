import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil", // Use the latest API version
});

export interface StripePlan {
  priceId: string;
  lookup_key: string;
  name: string;
  price: string;
  features: string[];
}

/**
 * Fetches all pricing plans from Stripe
 */
export async function getStripePlans(): Promise<StripePlan[]> {
  try {
    // Fetch prices from Stripe
    const prices = await stripe.prices.list({
      expand: ["data.product"],
    });

    // Transform the Stripe response into our application format
    const plans = prices.data.map((price) => {
      const product = price.product as Stripe.Product;

      return {
        priceId: price.id,
        lookup_key: price.lookup_key || "",
        name: product.name,
        price: formatPrice(price),
        features: product.metadata.features ? JSON.parse(product.metadata.features) : [],
      };
    });

    return plans;
  } catch (error) {
    console.error("Error fetching Stripe plans:", error);
    return [];
  }
}

/**
 * Fetches a specific subscription from Stripe
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["default_payment_method", "items.data.price.product"],
    });
    return subscription;
  } catch (error) {
    console.error(`Error fetching subscription ${subscriptionId}:`, error);
    return null;
  }
}

/**
 * Helper function to format price based on currency and billing interval
 */
function formatPrice(price: Stripe.Price): string {
  const amount = price.unit_amount ? price.unit_amount / 100 : 0;
  const currency = price.currency.toUpperCase();
  const interval = price.recurring?.interval;

  return `${amount} ${currency}${interval ? `/${interval}` : ""}`;
}
