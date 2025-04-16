import { loadStripe } from "@stripe/stripe-js";
import Stripe from "stripe";

import { getStripeInstance } from "./stripe-admin";

// Use the shared Stripe instance
const stripe = getStripeInstance();

export interface StripePlan {
  priceId: string;
  lookup_key: string;
  name: string;
  price: string;
  features: string[];
}

/**
 * Creates a new customer in Stripe
 */
export async function createStripeCustomer(email: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.create({
      email,
    });
    return customer.id;
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    return null;
  }
}

/**
 * Fetches all pricing plans from Stripe
 */
export async function getStripePlans(productId?: string): Promise<StripePlan[]> {
  try {
    // Fetch prices from Stripe
    const prices = await stripe.prices.list({
      expand: ["data.product"],
      active: true,
      ...(productId ? { product: productId } : {}),
    });

    // Transform the Stripe response into our application format
    const plans = prices.data.map((price) => {
      const product = price.product as Stripe.Product;

      // Check for features in both price metadata and product metadata
      let features: string[] = [];

      // First try to get features from price metadata
      if (price.metadata) {
        // Look for individual feature entries (feature_1, feature_2, etc.)
        const featureEntries = Object.entries(price.metadata)
          .filter(([key]) => key.startsWith("feature_"))
          .sort(([keyA], [keyB]) => {
            // Sort by feature number if possible
            const numA = parseInt(keyA.split("_")[1]);
            const numB = parseInt(keyB.split("_")[1]);
            return numA - numB;
          });

        if (featureEntries.length > 0) {
          features = featureEntries.map(([_, value]) => value);
        }
        // Also check for legacy format (JSON array in 'features' field)
        else if (price.metadata.features) {
          try {
            features = JSON.parse(price.metadata.features);
          } catch (e) {
            console.error("Error parsing price features metadata:", e);
          }
        }
      }

      // If no features in price metadata, try product metadata
      if (features.length === 0 && product.metadata) {
        // First check for individual feature entries
        const featureEntries = Object.entries(product.metadata)
          .filter(([key]) => key.startsWith("feature_"))
          .sort(([keyA], [keyB]) => {
            const numA = parseInt(keyA.split("_")[1]);
            const numB = parseInt(keyB.split("_")[1]);
            return numA - numB;
          });

        if (featureEntries.length > 0) {
          features = featureEntries.map(([_, value]) => value);
        }
        // Also check for legacy format
        else if (product.metadata.features) {
          try {
            features = JSON.parse(product.metadata.features);
          } catch (e) {
            console.error("Error parsing product features metadata:", e);
          }
        }
      }

      return {
        priceId: price.id,
        lookup_key: price.lookup_key || "",
        name: product.name,
        price: formatPrice(price),
        features,
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

/**
 * Updates features in a Stripe price's metadata using individual key-value pairs
 */
export async function updatePriceFeatures(priceId: string, features: string[]): Promise<boolean> {
  try {
    // Create metadata object with feature_1, feature_2, etc. keys
    const metadata: Record<string, string> = {};

    // Add features as individual entries
    features.forEach((feature, index) => {
      metadata[`feature_${index + 1}`] = feature;
    });

    const updatedPrice = await stripe.prices.update(priceId, {
      metadata,
    });

    return !!updatedPrice?.id;
  } catch (error) {
    console.error(`Error updating features for price ${priceId}:`, error);
    return false;
  }
}

/**
 * Updates features in a Stripe product's metadata using individual key-value pairs
 */
export async function updateProductFeatures(
  productId: string,
  features: string[],
): Promise<boolean> {
  try {
    // Create metadata object with feature_1, feature_2, etc. keys
    const metadata: Record<string, string> = {};

    // Add features as individual entries
    features.forEach((feature, index) => {
      metadata[`feature_${index + 1}`] = feature;
    });

    const updatedProduct = await stripe.products.update(productId, {
      metadata,
    });

    return !!updatedProduct?.id;
  } catch (error) {
    console.error(`Error updating features for product ${productId}:`, error);
    return false;
  }
}

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.error("Stripe publishable key is missing!");
    return null;
  }

  if (!stripePromise) {
    try {
      stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
      if (!stripePromise) {
        console.error("Failed to initialize Stripe");
        return null;
      }
    } catch (error) {
      console.error("Error initializing Stripe:", error);
      return null;
    }
  }

  return stripePromise;
};
