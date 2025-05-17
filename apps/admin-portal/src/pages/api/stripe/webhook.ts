import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

import { createClient } from "@/utils/supabase/component";

import { sendEmailViaWebhook } from "@/lib/email";
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
  "invoice.payment_succeeded",
  "customer.subscription.trial_will_end",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
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
    const stripe = getStripeInstance();

    console.log(`Processing webhook event: ${event.type}`, {
      id: event.id,
      api_version: event.api_version,
    });

    // Handle invoice payment events
    if (event.type === "invoice.payment_succeeded") {
      return await handleInvoicePaymentSucceeded(event, stripe, supabase, res);
    }

    // Handle payment intent events
    if (
      event.type === "payment_intent.succeeded" ||
      event.type === "payment_intent.payment_failed"
    ) {
      return await handlePaymentIntentEvents(event, stripe, supabase, res);
    }

    // Handle subscription events
    try {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Get the price details
      let priceId = "";
      if (subscription.items?.data?.length > 0) {
        priceId = subscription.items.data[0].price.id;
      }

      console.log(`Processing ${event.type}:`, {
        customerId,
        priceId,
        status: subscription.status,
      });

      // Safely fetch customer and price details with error handling
      let customer;
      let price;
      let profile;

      try {
        customer = await stripe.customers.retrieve(customerId);
        console.log("Retrieved customer:", { id: customerId, deleted: customer.deleted });
      } catch (customerError) {
        console.error("Error retrieving customer:", customerError);
        customer = { deleted: true, email: null };
      }

      try {
        if (priceId) {
          price = await stripe.prices.retrieve(priceId);
          console.log("Retrieved price:", { id: priceId, lookup_key: price.lookup_key });
        } else {
          console.log("No price ID available from subscription");
          price = {
            lookup_key: null,
            unit_amount: 0,
            currency: "usd",
            recurring: { interval: "month" },
          };
        }
      } catch (priceError) {
        console.error("Error retrieving price:", priceError);
        price = {
          lookup_key: null,
          unit_amount: 0,
          currency: "usd",
          recurring: { interval: "month" },
        };
      }

      // Safely fetch profile with error handling
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("stripe_customer_id", customerId)
          .single();

        if (error) {
          console.warn("No profile found for customer ID:", customerId, error);
        } else {
          profile = data;
          console.log("Retrieved profile:", { id: profile.id });
        }
      } catch (profileError) {
        console.error("Error retrieving profile:", profileError);
      }

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
          if (subscription.cancel_at || subscription.cancel_at_period_end) {
            console.log("Subscription scheduled for cancellation", {
              subscriptionId: subscription.id,
              cancel_at: subscription.cancel_at
                ? new Date(subscription.cancel_at * 1000).toISOString()
                : null,
              cancel_at_period_end: subscription.cancel_at_period_end,
              current_period_end: new Date(
                (subscription as any).current_period_end * 1000,
              ).toISOString(),
            });

            // Check if the end date has passed (in case of delayed webhook)
            const now = Math.floor(Date.now() / 1000);
            const currentPeriodEnd = (subscription as any).current_period_end;
            const cancelAt = subscription.cancel_at || currentPeriodEnd;

            // Skip updating if no profile found
            if (!profile) {
              console.warn(
                "No profile found for subscription cancellation. Customer ID:",
                customerId,
              );
              break;
            }

            if (cancelAt < now) {
              // The cancellation date has already passed, immediately set to free plan
              console.log("Cancellation date has passed, resetting to free plan immediately", {
                cancelAt: new Date(cancelAt * 1000).toISOString(),
                now: new Date(now * 1000).toISOString(),
              });

              try {
                const { error } = await supabase
                  .from("profiles")
                  .update({
                    subscribed_to: "tanad_free",
                    price_id: process.env.FREE_PLAN_ID || null,
                    cancel_at_period_end: false,
                    cancel_at: null,
                  })
                  .eq("stripe_customer_id", customerId);

                if (error) {
                  console.error("Error updating profile to free plan:", error);
                } else {
                  console.log("✓ Profile updated to free plan due to passed cancellation date");
                }
              } catch (updateError) {
                console.error("Failed to update profile after cancellation:", updateError);
              }
            } else {
              // Update profile to mark subscription as being canceled
              try {
                const { error } = await supabase
                  .from("profiles")
                  .update({
                    cancel_at_period_end: true,
                    cancel_at: subscription.cancel_at || (subscription as any).current_period_end,
                    // Keep the current subscription for now
                    subscribed_to: price?.lookup_key || profile?.subscribed_to,
                    price_id: priceId || profile?.price_id,
                  })
                  .eq("stripe_customer_id", customerId);

                if (error) {
                  console.error("Error updating profile for cancellation:", error);
                } else {
                  console.log("✓ Updated profile to mark subscription as being canceled:", {
                    customerId,
                    cancel_at: subscription.cancel_at,
                    cancel_at_period_end: subscription.cancel_at_period_end,
                  });
                }
              } catch (updateError) {
                console.error("Failed to update profile for cancellation:", updateError);
              }

              // Check if we're in the final billing period (current date is within the final period)
              const isInFinalBillingPeriod =
                currentPeriodEnd > now &&
                (subscription.cancel_at_period_end ||
                  (subscription.cancel_at && subscription.cancel_at <= currentPeriodEnd));

              if (isInFinalBillingPeriod) {
                console.log("✓ Subscription is in final billing period, marked as canceling");
              }

              // Send email about cancellation
              if (profile && profile.email && process.env.SUB_UPDATED_WEBHOOK_URL) {
                try {
                  await sendEmailViaWebhook(process.env.SUB_UPDATED_WEBHOOK_URL, {
                    customerId,
                    email: profile.email,
                    planName: price?.lookup_key || profile.subscribed_to,
                    amount: price?.unit_amount ? (price.unit_amount / 100).toString() : "0",
                    currency: price?.currency?.toUpperCase() || "SAR",
                    billingInterval: `per ${price?.recurring?.interval || "month"}`,
                    language:
                      subscription.metadata?.language || profile.user_settings?.language || "ar",
                    status: "canceling", // Custom status to indicate being canceled
                    cancelAt: subscription.cancel_at
                      ? new Date(subscription.cancel_at * 1000).toISOString()
                      : new Date((subscription as any).current_period_end * 1000).toISOString(),
                  });
                  console.log("✓ Cancellation email sent successfully");
                } catch (error) {
                  console.error("❌ Failed to send cancellation email:", error);
                }
              } else {
                console.log("Skipping cancellation email - missing data:", {
                  hasProfile: !!profile,
                  hasEmail: !!(profile && profile.email),
                  hasWebhookUrl: !!process.env.SUB_UPDATED_WEBHOOK_URL,
                });
              }
            }
          } else {
            // Regular subscription update (not cancellation)
            // Skip updating if no profile found
            if (!profile) {
              console.warn("No profile found for subscription update. Customer ID:", customerId);
              break;
            }

            try {
              const { error } = await supabase
                .from("profiles")
                .update({
                  subscribed_to: price?.lookup_key || profile.subscribed_to,
                  price_id: priceId || profile.price_id,
                  // Clear cancellation flags if they exist
                  cancel_at_period_end: false,
                  cancel_at: null,
                })
                .eq("stripe_customer_id", customerId);

              if (error) {
                console.error("Error updating profile for subscription update:", error);
              } else {
                console.log("✓ Profile updated for subscription update");
              }
            } catch (updateError) {
              console.error("Failed to update profile for subscription update:", updateError);
            }

            // Send email notification
            if (profile && profile.email && process.env.SUB_UPDATED_WEBHOOK_URL) {
              try {
                await sendEmailViaWebhook(process.env.SUB_UPDATED_WEBHOOK_URL, {
                  customerId,
                  email: profile.email,
                  planName: price?.lookup_key || profile.subscribed_to,
                  amount: price?.unit_amount ? (price.unit_amount / 100).toString() : "0",
                  currency: price?.currency?.toUpperCase() || "SAR",
                  billingInterval: `per ${price?.recurring?.interval || "month"}`,
                  language:
                    subscription.metadata?.language || profile.user_settings?.language || "ar",
                  status: subscription.status,
                });
                console.log("✓ Updated subscription email sent successfully");
              } catch (error) {
                console.error("❌ Failed to send updated subscription email:", error);
              }
            } else {
              console.log("Skipping subscription update email - missing data:", {
                hasProfile: !!profile,
                hasEmail: !!(profile && profile.email),
                hasWebhookUrl: !!process.env.SUB_UPDATED_WEBHOOK_URL,
              });
            }
          }
          break;

        case "customer.subscription.deleted":
          // Get the last price details before deletion
          console.log("Subscription deleted/expired event received", {
            subscriptionId: subscription.id,
            customerId,
            status: subscription.status,
            cancelReason: subscription.cancellation_details?.reason,
            canceledAt: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
            endedAt: subscription.ended_at
              ? new Date(subscription.ended_at * 1000).toISOString()
              : null,
          });

          // Skip updating if no profile found
          if (!profile) {
            console.warn("No profile found for subscription deletion. Customer ID:", customerId);
            break;
          }

          // Update the user profile to the free plan
          try {
            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                subscribed_to: "tanad_free",
                price_id: process.env.FREE_PLAN_ID || null,
                cancel_at_period_end: false, // Reset cancellation flags
                cancel_at: null,
              })
              .eq("stripe_customer_id", customerId);

            if (updateError) {
              console.error("❌ Error updating profile to free plan:", updateError);
            } else {
              console.log("✓ Subscription expired/deleted, reset to free plan:", {
                customerId,
                previousPlan: price?.lookup_key || profile.subscribed_to || "unknown",
                updatedTo: "tanad_free",
              });
            }
          } catch (updateError) {
            console.error("Failed to update profile after subscription deletion:", updateError);
          }

          // Send email notification
          if (profile && profile.email && process.env.SUB_EXPIRATION_WEBHOOK_URL) {
            try {
              await sendEmailViaWebhook(process.env.SUB_EXPIRATION_WEBHOOK_URL, {
                customerId,
                email: profile.email,
                planName: price?.lookup_key || profile.subscribed_to,
                amount: price?.unit_amount ? (price.unit_amount / 100).toString() : "0",
                currency: price?.currency?.toUpperCase() || "SAR",
                billingInterval: `per ${price?.recurring?.interval || "month"}`,
                language:
                  subscription.metadata?.language || profile.user_settings?.language || "ar",
              });
              console.log("✓ Expiration email sent successfully");
            } catch (error) {
              console.error("❌ Failed to send expiration email:", error);
            }
          } else {
            console.log("Skipping expiration email - missing data:", {
              hasProfile: !!profile,
              hasEmail: !!(profile && profile.email),
              hasWebhookUrl: !!process.env.SUB_EXPIRATION_WEBHOOK_URL,
            });
          }
          break;

        case "customer.subscription.trial_will_end":
          console.log("Trial will end event received", {
            subscriptionId: subscription.id,
            customerId,
            status: subscription.status,
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
          });

          try {
            await sendEmailViaWebhook(process.env.TRIAL_ENDING_WEBHOOK_URL!, {
              customerId,
              email: profile?.email,
              planName: price.lookup_key,
              amount: (price.unit_amount! / 100).toString(),
              currency: price.currency.toUpperCase(),
              billingInterval: `per ${price.recurring?.interval || "month"}`,
              language: subscription.metadata?.language || "ar",
              trialEnd: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
              daysRemaining: subscription.trial_end
                ? Math.ceil((subscription.trial_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
                : 0,
            });
            console.log("✓ Trial ending email sent successfully");
          } catch (error) {
            console.error("❌ Failed to send trial ending email:", error);
          }
          break;
      }

      return res.json({ received: true });
    } catch (error) {
      console.error("❌ Error processing subscription event:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Error processing subscription event",
      });
    }
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error processing webhook",
    });
  }
}

// Handle invoice payment succeeded events
async function handleInvoicePaymentSucceeded(
  event: Stripe.Event,
  stripe: Stripe,
  supabase: any,
  res: NextApiResponse,
) {
  try {
    const invoice = event.data.object as Stripe.Invoice;
    // Get subscription ID if it exists
    const subscriptionId = (invoice as any).subscription;

    if (!subscriptionId) {
      return res.json({ received: true, message: "Invoice not related to a subscription" });
    }

    // Get the subscription to check cancellation status
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = typeof subscription.customer === "string" ? subscription.customer : null;

    if (!customerId) {
      return res.json({ received: true, message: "Could not determine customer ID" });
    }

    console.log("Invoice payment succeeded for subscription:", {
      subscriptionId,
      customerId,
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
    });

    // Check if this is the final invoice for a subscription scheduled to be canceled
    if (subscription.cancel_at_period_end) {
      console.log("This may be the final payment for a subscription scheduled to be canceled");

      // Get customer profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile) {
        // Ensure the profile is marked correctly for cancellation
        await supabase
          .from("profiles")
          .update({
            cancel_at_period_end: true,
            cancel_at: (subscription as any).current_period_end,
          })
          .eq("id", profile.id);

        console.log("✓ Updated profile with accurate cancellation date", {
          userId: profile.id,
          cancelAt: new Date((subscription as any).current_period_end * 1000).toISOString(),
        });
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("❌ Error processing invoice payment webhook:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error processing invoice payment webhook",
    });
  }
}

// Handle payment intent events
async function handlePaymentIntentEvents(
  event: Stripe.Event,
  stripe: Stripe,
  supabase: any,
  res: NextApiResponse,
) {
  try {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const customerId = paymentIntent.customer as string;

    console.log("Payment intent event received:", {
      customerId,
      status: paymentIntent.status,
    });

    // Get the user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("stripe_customer_id", customerId)
      .single();

    if (!profile) {
      return res.status(404).json({ error: "Customer profile not found" });
    }

    // Handle payment succeeded event
    if (event.type === "payment_intent.succeeded") {
      console.log("Payment succeeded event received");

      // Check if payment intent is associated with a subscription
      if (paymentIntent.metadata?.subscription_id) {
        // Get the subscription to check cancellation status
        const subscription = await stripe.subscriptions.retrieve(
          paymentIntent.metadata.subscription_id,
        );

        if (subscription.cancel_at_period_end) {
          console.log("This may be the final payment for a subscription scheduled to be canceled");

          // Ensure the profile is marked correctly for cancellation
          await supabase
            .from("profiles")
            .update({
              cancel_at_period_end: true,
              cancel_at: (subscription as any).current_period_end,
            })
            .eq("id", profile.id);

          console.log("✓ Updated profile with accurate cancellation date", {
            userId: profile.id,
            cancelAt: new Date((subscription as any).current_period_end * 1000).toISOString(),
          });
        }
      }

      // Send email about payment succeeded
      try {
        await sendEmailViaWebhook(process.env.PAYMENT_SUCCEEDED_WEBHOOK_URL!, {
          customerId,
          email: profile.email,
          planName: profile.subscribed_to,
          amount: (paymentIntent.amount! / 100).toString(),
          currency: paymentIntent.currency?.toUpperCase() || "USD",
          language: profile.language || "ar",
          status: "succeeded",
        });
        console.log("✓ Payment succeeded email sent successfully");
      } catch (error) {
        console.error("❌ Failed to send payment succeeded email:", error);
      }
    }

    // Handle payment failed event
    if (event.type === "payment_intent.payment_failed") {
      console.log("Payment failed event received");

      // Send email about payment failed
      try {
        await sendEmailViaWebhook(process.env.PAYMENT_FAILED_WEBHOOK_URL!, {
          customerId,
          email: profile.email,
          planName: profile.subscribed_to,
          amount: (paymentIntent.amount! / 100).toString(),
          currency: paymentIntent.currency?.toUpperCase() || "USD",
          language: profile.language || "ar",
          status: "failed",
        });
        console.log("✓ Payment failed email sent successfully");
      } catch (error) {
        console.error("❌ Failed to send payment failed email:", error);
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("❌ Error processing payment intent webhook:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error processing payment intent webhook",
    });
  }
}
