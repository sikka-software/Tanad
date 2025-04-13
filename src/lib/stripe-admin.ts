import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripeInstance() {
  if (stripeInstance) {
    return stripeInstance;
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe secret key is missing. Set STRIPE_SECRET_KEY in your .env file.");
  }

  stripeInstance = new Stripe(key, {
    typescript: true,
    appInfo: {
      name: "Lazim",
      version: "0.1.0",
    },
  });

  return stripeInstance;
}
