import { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/component";

import { getStripeInstance } from "@/lib/stripe-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, name, userId } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Get the Stripe instance
    const stripe = getStripeInstance();

    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email,
      name: name || email.split("@")[0], // Use name if provided, otherwise use part of email
      metadata: {
        source: "tanad_admin_portal",
        user_id: userId || "",
      },
    });

    // If we have a userId, update the user's profile with the customer ID
    if (userId) {
      try {
        const supabase = createClient();

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ stripe_customer_id: customer.id })
          .eq("id", userId);

        if (updateError) {
          console.error("Error updating profile with Stripe customer ID:", updateError);
          // Continue anyway - we'll return the customer ID to the client
        } else {
          console.log(`Updated profile ${userId} with Stripe customer ID: ${customer.id}`);
        }
      } catch (dbError) {
        console.error("Database error when updating profile:", dbError);
        // We'll continue and return the customer ID even if the database update fails
      }
    }

    // Return the customer ID
    return res.status(200).json({
      success: true,
      customerId: customer.id,
    });
  } catch (error: any) {
    console.error("Error creating Stripe customer:", error);
    return res.status(500).json({
      error: "Failed to create Stripe customer",
      message: error.message,
    });
  }
}
