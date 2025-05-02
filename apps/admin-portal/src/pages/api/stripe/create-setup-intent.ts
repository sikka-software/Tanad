import { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/component";

import { getStripeInstance } from "@/lib/stripe-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const supabase = createClient();

  try {
    const { customerId, userId } = req.body;

    // Check if either customer ID or user ID is provided
    if (!customerId && !userId) {
      return res.status(400).json({
        error: "Either Customer ID or User ID is required",
      });
    }

    const stripe = await getStripeInstance();
    let customerIdToUse = customerId;

    // If customer ID is not provided but user ID is, look up the customer ID
    if (!customerIdToUse && userId) {
      console.log(`Looking up customer ID for user: ${userId}`);

      // Try to find the customer ID in the profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("stripe_customer_id, email, full_name")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error finding user profile:", profileError);
        return res.status(404).json({
          error: "User not found",
          message: "Could not find user profile",
        });
      }

      console.log("Found user profile:", profile);

      if (profile?.stripe_customer_id) {
        console.log(`Found existing stripe customer ID: ${profile.stripe_customer_id}`);
        customerIdToUse = profile.stripe_customer_id;
      } else {
        // Create a new customer if one doesn't exist
        console.log("No stripe customer ID found, creating new customer");
        const customer = await stripe.customers.create({
          email: profile?.email || undefined,
          name: profile?.full_name || undefined,
          metadata: {
            userId: userId,
          },
        });
        customerIdToUse = customer.id;
        console.log(`Created new stripe customer: ${customerIdToUse}`);

        // Update user with stripe customer id
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ stripe_customer_id: customerIdToUse })
          .eq("id", userId);

        if (updateError) {
          console.error("Error updating profile with customer ID:", updateError);
        } else {
          console.log(`Updated user profile with stripe customer ID: ${customerIdToUse}`);
        }
      }
    }

    if (!customerIdToUse) {
      return res.status(400).json({
        error: "Customer ID is required",
        message: "Could not obtain a valid customer ID",
      });
    }

    // Validate the customer exists
    try {
      const customer = await stripe.customers.retrieve(customerIdToUse);
      if (!customer || (customer as any).deleted) {
        return res.status(400).json({
          error: "Invalid customer ID",
        });
      }
    } catch (error) {
      console.error("Error retrieving customer:", error);
      return res.status(400).json({
        error: "Failed to verify customer",
      });
    }

    console.log(`Creating setup intent for customer: ${customerIdToUse}`);

    // Create a SetupIntent (for saving card)
    const setupIntent = await stripe.setupIntents.create({
      customer: customerIdToUse,
      payment_method_types: ["card"],
      usage: "off_session", // Important: Allows the payment method to be used for future payments
    });

    // Validate the setup intent
    if (!setupIntent || !setupIntent.client_secret) {
      throw new Error("Failed to create setup intent");
    }

    console.log(`Setup intent created: ${setupIntent.id}`);

    return res.status(200).json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      customerId: customerIdToUse,
      status: setupIntent.status,
    });
  } catch (error) {
    console.error("Error creating setup intent:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create setup intent",
    });
  }
}
