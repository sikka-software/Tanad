import type { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/component";

import { getStripeInstance } from "@/lib/stripe-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const supabase = createClient();
  try {
    const stripe = getStripeInstance();
    const { subscriptionId, userId, cancelAtPeriodEnd = true } = req.body;

    if (!subscriptionId || !userId) {
      return res.status(400).json({
        error: "Subscription ID and User ID are required",
      });
    }

    // Special case for "profile-based" subscriptions
    if (subscriptionId === "profile-based") {
      console.log("Handling profile-based subscription cancellation for user:", userId);

      // Get the user profile to get current subscription details
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, subscribed_to, price_id, stripe_customer_id")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return res.status(500).json({
          error: "Failed to fetch user profile",
        });
      }

      // Set cancellation information in the profile
      const cancelAt = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now in seconds
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          cancel_at_period_end: cancelAtPeriodEnd,
          cancel_at: cancelAtPeriodEnd ? cancelAt : Math.floor(Date.now() / 1000), // If immediate cancellation, set to now
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating user profile:", updateError);
        return res.status(500).json({
          error: "Failed to update user profile",
        });
      }

      // Check if we have a customer ID to find subscription(s) in Stripe
      let stripeSubscriptionId = null;
      let stripeSubscriptionStatus = "active";
      let stripeCancelAt: number | null = cancelAt;

      if (profile.stripe_customer_id) {
        try {
          // Find active subscriptions for this customer
          console.log("Looking for active subscriptions for customer:", profile.stripe_customer_id);
          const subscriptions = await stripe.subscriptions.list({
            customer: profile.stripe_customer_id,
            status: "active",
            limit: 1,
          });

          if (subscriptions.data.length > 0) {
            const activeSubscription = subscriptions.data[0];
            stripeSubscriptionId = activeSubscription.id;

            // Now cancel this subscription
            let canceledSubscription;
            if (cancelAtPeriodEnd) {
              // Schedule cancellation at period end
              canceledSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
                cancel_at_period_end: true,
              });
              console.log(
                `Subscription ${stripeSubscriptionId} scheduled for cancellation at period end`,
              );
            } else {
              // Immediate cancellation
              try {
                console.log(
                  `Attempting immediate cancellation of subscription ${stripeSubscriptionId}`,
                );
                canceledSubscription = await stripe.subscriptions.cancel(stripeSubscriptionId);
                console.log(
                  `Successfully canceled subscription ${stripeSubscriptionId} immediately. New status: ${canceledSubscription.status}`,
                );
              } catch (error) {
                console.error(
                  `Error immediately canceling subscription ${stripeSubscriptionId}:`,
                  error,
                );
                // If immediate cancellation fails, try updating it instead
                console.log(
                  `Falling back to cancel_at_period_end for subscription ${stripeSubscriptionId}`,
                );
                canceledSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
                  cancel_at_period_end: true,
                });
              }
            }

            stripeSubscriptionStatus = canceledSubscription.status;
            stripeCancelAt = canceledSubscription.cancel_at;

            console.log("Found and updated Stripe subscription:", canceledSubscription.id);
          } else {
            console.log("No active subscriptions found for customer:", profile.stripe_customer_id);
          }
        } catch (stripeError) {
          console.error("Error finding or updating Stripe subscription:", stripeError);
          // Continue with the profile-based cancellation even if Stripe update fails
        }
      }

      return res.status(200).json({
        success: true,
        subscriptionId: stripeSubscriptionId || "profile-based",
        status: stripeSubscriptionStatus,
        cancelAt: stripeCancelAt,
        message: cancelAtPeriodEnd
          ? "Subscription will be canceled at the end of the billing period"
          : "Subscription canceled immediately",
      });
    }

    let canceledSubscription;

    if (cancelAtPeriodEnd) {
      // Schedule cancellation at period end (subscription remains active until then)
      canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      console.log(`Subscription ${subscriptionId} scheduled for cancellation at period end`);
    } else {
      // Immediate cancellation
      try {
        console.log(`Attempting immediate cancellation of subscription ${subscriptionId}`);
        canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
        console.log(
          `Successfully canceled subscription ${subscriptionId} immediately. New status: ${canceledSubscription.status}`,
        );
      } catch (error) {
        console.error(`Error immediately canceling subscription ${subscriptionId}:`, error);
        // If immediate cancellation fails, try updating it instead
        console.log(`Falling back to cancel_at_period_end for subscription ${subscriptionId}`);
        canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }
    }

    // Update user profile in Supabase if needed
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        cancel_at_period_end: cancelAtPeriodEnd,
        cancel_at: canceledSubscription.cancel_at || null,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user profile:", updateError);
    }

    return res.status(200).json({
      success: true,
      subscriptionId: canceledSubscription.id,
      status: canceledSubscription.status,
      cancelAt: canceledSubscription.cancel_at,
      message: cancelAtPeriodEnd
        ? "Subscription will be canceled at the end of the billing period"
        : "Subscription canceled immediately",
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return res.status(500).json({
      error: "Failed to cancel subscription",
    });
  }
}
