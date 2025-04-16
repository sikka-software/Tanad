import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripeInstance() {
  if (stripeInstance) {
    return stripeInstance;
  }

  const key = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;

  // More thorough validation of the key format
  if (!key || key === "" || key.includes("mock_key") || !key.startsWith("sk_")) {
    console.error("Missing or invalid Stripe secret key. Please check your environment variables.");
    throw new Error(
      "Stripe secret key is missing or invalid. Set NEXT_PUBLIC_STRIPE_SECRET_KEY in your .env file with a valid key.",
    );
  }

  try {
    stripeInstance = new Stripe(key, {
      apiVersion: "2025-03-31.basil", // Use the API version specified in the type
      appInfo: {
        name: "Tanad",
        version: "0.1.0",
      },
    });

    return stripeInstance;
  } catch (error) {
    console.error("Error initializing Stripe:", error);
    throw new Error("Failed to initialize Stripe client. Please check your API key.");
  }
}
