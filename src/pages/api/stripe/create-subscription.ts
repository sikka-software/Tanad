import type { NextApiRequest, NextApiResponse } from "next";

import Stripe from "stripe";

import { getPlanIdForPriceId } from "@/lib/stripe";
import { getStripeInstance } from "@/lib/stripe-admin";
import { supabase } from "@/lib/supabase";

/**
 * API endpoint to create or update a subscription
 *
 * This endpoint handles creating new subscriptions or updating existing ones.
 * It supports direct payment method attachment for subscription creation.
 *
 * @param req.body.priceId - The Stripe price ID for the subscription
 * @param req.body.userId - The user ID in the database
 * @param req.body.customerId - The Stripe customer ID (optional if userId is provided)
 * @param req.body.paymentMethodId - The Stripe payment method ID
 *
 * @returns {Object} Response object with subscription details
 * @returns {string} response.subscriptionId - The ID of the created subscription
 * @returns {string} response.status - The status of the subscription
 * @returns {boolean} response.success - Whether the operation was successful
 * @returns {string|null} response.clientSecret - Client secret for payment if needed
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stripe = getStripeInstance();
    const { priceId, customerId, userId, paymentMethodId } = req.body;

    if (!priceId) {
      return res.status(400).json({
        error: "Missing required parameter: priceId",
        message: "Price ID is required to create a subscription",
      });
    }

    // Either need a customer ID or user ID
    if (!customerId && !userId) {
      return res.status(400).json({
        error: "Missing required parameters",
        message: "Either Customer ID or User ID is required",
      });
    }

    // Get customer info if we have userId but no customerId
    let customerIdToUse = customerId;
    let userProfile = null;

    if (
      userId &&
      (!customerIdToUse || customerIdToUse === "null" || customerIdToUse === "undefined")
    ) {
      console.log(`No valid customer ID provided, looking up by user ID: ${userId}`);

      // Try up to 3 times with a delay to find the profile
      let retryCount = 0;
      const maxRetries = 3;
      let profileFound = false;

      while (retryCount < maxRetries && !profileFound) {
        // If this is a retry, wait before trying again
        if (retryCount > 0) {
          console.log(`Retry ${retryCount}/${maxRetries} finding user profile, waiting...`);
          // Wait 1 second between retries
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("stripe_customer_id, email, full_name, subscribed_to")
          .eq("id", userId)
          .single();

        if (profileError) {
          console.error(
            `Attempt ${retryCount + 1}/${maxRetries} - Error finding user profile:`,
            profileError,
          );
          retryCount++;
        } else {
          profileFound = true;
          userProfile = profile;
          console.log("Found user profile:", userProfile);

          if (profile?.stripe_customer_id) {
            console.log(`Found existing stripe customer ID: ${profile.stripe_customer_id}`);
            customerIdToUse = profile.stripe_customer_id;
          } else {
            // Create a new customer if one doesn't exist
            console.log("Profile found but no stripe customer ID, creating new customer");
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
      }

      // If we couldn't find a profile after all retries, create a new Stripe customer with just the user ID
      if (!profileFound) {
        console.log(
          "Could not find user profile after retries. Creating Stripe customer with user ID only",
        );
        try {
          // Try one more time with a more limited query to avoid schema issues
          const { data: basicProfile, error: basicProfileError } = await supabase
            .from("profiles")
            .select("id, email, full_name")
            .eq("id", userId)
            .single();

          if (!basicProfileError && basicProfile) {
            console.log("Found basic profile info without full schema:", basicProfile);
            const customer = await stripe.customers.create({
              email: basicProfile?.email || undefined,
              name: basicProfile?.full_name || undefined,
              metadata: {
                userId: userId,
              },
            });
            customerIdToUse = customer.id;
            console.log(`Created new stripe customer with basic profile: ${customerIdToUse}`);

            // Don't try to update the profile since it might cause schema issues
          } else {
            // Fall back to creating a customer with just user ID
            const customer = await stripe.customers.create({
              metadata: {
                userId: userId,
              },
            });
            customerIdToUse = customer.id;
            console.log(`Created new stripe customer without profile: ${customerIdToUse}`);
          }
        } catch (stripeError) {
          console.error("Error creating Stripe customer without profile:", stripeError);
          return res.status(400).json({
            error: "Stripe customer creation failed",
            message: "Could not create a Stripe customer",
          });
        }
      }
    }

    if (!customerIdToUse) {
      return res.status(400).json({
        error: "Customer ID required",
        message: "Failed to obtain valid customer ID for subscription",
      });
    }

    // Get the lookup key for this price ID
    let lookupKey = await getPlanIdForPriceId(priceId);
    console.log("Creating subscription for plan:", lookupKey);

    // For free plan, just update the user's subscription status without creating a Stripe subscription
    if (lookupKey === "tanad_free") {
      if (userId) {
        await supabase
          .from("profiles")
          .update({
            subscribed_to: lookupKey,
            price_id: null,
          })
          .eq("id", userId);
        console.log(`Updated user ${userId} to free plan`);
      }
      return res.status(200).json({
        success: true,
        status: "active",
        isActive: true,
      });
    }

    // If payment method is provided, attach it to the customer
    if (paymentMethodId) {
      try {
        // First check if payment method exists
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

        if (!paymentMethod) {
          return res.status(400).json({ error: "Invalid payment method" });
        }

        // Attach payment method to customer if not already attached
        try {
          await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerIdToUse,
          });
          console.log(`Payment method ${paymentMethodId} attached to customer ${customerIdToUse}`);
        } catch (error: any) {
          // Ignore if payment method is already attached
          if (error.code !== "payment_method_already_attached") {
            console.error("Error attaching payment method:", error);
            return res.status(400).json({
              error: "Failed to attach payment method",
              message: error.message,
            });
          } else {
            console.log(
              `Payment method ${paymentMethodId} already attached to customer ${customerIdToUse}`,
            );
          }
        }

        // Set as default payment method
        await stripe.customers.update(customerIdToUse, {
          invoice_settings: { default_payment_method: paymentMethodId },
        });
      } catch (error: any) {
        console.error("Error processing payment method:", error);
        return res.status(400).json({
          error: "Failed to process payment method",
          message: error.message || "An error occurred while processing the payment method",
        });
      }
    }

    // Check if the user already has an active subscription
    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customerIdToUse,
      status: "active",
      limit: 1,
    });

    let subscription;
    let status;
    let clientSecret = null;

    // If there is an existing subscription, update it
    if (subscriptions && subscriptions.length > 0) {
      const existingSubscription = subscriptions[0] as Stripe.Subscription;

      const subscriptionUpdateParams: Stripe.SubscriptionUpdateParams = {
        items: [
          {
            id: (existingSubscription.items as any).data[0].id,
            price: priceId,
          },
        ],
        proration_behavior: "always_invoice",
      };

      if (paymentMethodId) {
        subscriptionUpdateParams.default_payment_method = paymentMethodId;
      }

      // We won't expand payment_intent directly to avoid the error
      subscription = await stripe.subscriptions.update(
        existingSubscription.id,
        subscriptionUpdateParams,
      );

      status = subscription.status;

      // Safely check for payment intent by retrieving the invoice separately if needed
      if (subscription.latest_invoice && typeof subscription.latest_invoice === "string") {
        try {
          // First, retrieve the invoice without expanding payment_intent
          const basicInvoice = await stripe.invoices.retrieve(subscription.latest_invoice);

          // Only try to expand payment_intent if the invoice status suggests it might have a payment
          if (
            basicInvoice.status === "paid" ||
            basicInvoice.status === "open" ||
            (basicInvoice as any).payment_intent ||
            (basicInvoice as any).charge
          ) {
            try {
              const invoice = (await stripe.invoices.retrieve(subscription.latest_invoice, {
                expand: ["payment_intent"],
              })) as Stripe.Response<
                Stripe.Invoice & {
                  payment_intent?: Stripe.PaymentIntent;
                }
              >;

              if (invoice.payment_intent && typeof invoice.payment_intent !== "string") {
                clientSecret = invoice.payment_intent.client_secret;
                console.log(
                  `Retrieved client secret from latest invoice: ${subscription.latest_invoice}`,
                );
              }
            } catch (expandErr: any) {
              console.log(`Could not expand payment_intent on invoice: ${expandErr.message}`);

              // Try to check if there's a payment intent ID we can use directly
              if (
                (basicInvoice as any).payment_intent &&
                typeof (basicInvoice as any).payment_intent === "string"
              ) {
                try {
                  const paymentIntent = await stripe.paymentIntents.retrieve(
                    (basicInvoice as any).payment_intent,
                  );
                  clientSecret = paymentIntent.client_secret;
                  console.log(`Retrieved client secret directly from payment intent`);
                } catch (piErr: any) {
                  console.log(`Error retrieving payment intent directly: ${piErr.message}`);
                }
              }
            }
          } else {
            console.log(
              `Invoice ${basicInvoice.id} status is ${basicInvoice.status}, skipping payment_intent expansion`,
            );
          }
        } catch (err) {
          console.log("Error accessing latest invoice:", err);
        }
      } else {
        // If no invoice was created automatically during update, create one manually
        console.log("No invoice found after subscription update, creating invoice manually");
        try {
          // First create an upcoming invoice to capture the changes
          const invoice = await stripe.invoices.create({
            customer: customerIdToUse,
            subscription: subscription.id,
            auto_advance: true, // automatically finalize and attempt payment
            description: `Subscription update to ${lookupKey}`,
          });

          // Finalize the invoice and attempt to collect payment if needed
          if (invoice.status === "draft" && invoice.id) {
            await stripe.invoices.finalizeInvoice(invoice.id);
            if (paymentMethodId) {
              try {
                const paidInvoice = await stripe.invoices.pay(invoice.id);
                console.log(
                  `Invoice paid for update: ${paidInvoice.id}, status: ${paidInvoice.status}`,
                );
              } catch (payError) {
                console.error("Error paying update invoice:", payError);
              }
            }
          }

          console.log(
            `Manual invoice created for subscription update: ${invoice.id}, status: ${invoice.status}`,
          );

          // Try to get client secret in a safer way
          if (invoice.id) {
            try {
              // Wait a moment for Stripe to process the invoice
              await new Promise((resolve) => setTimeout(resolve, 1000));

              // Don't expand payment_intent directly to avoid errors
              const retrievedInvoice = await stripe.invoices.retrieve(invoice.id);

              // If the invoice has a payment intent, retrieve it directly
              if (
                (retrievedInvoice as any).payment_intent &&
                typeof (retrievedInvoice as any).payment_intent === "string"
              ) {
                const paymentIntent = await stripe.paymentIntents.retrieve(
                  (retrievedInvoice as any).payment_intent,
                );
                clientSecret = paymentIntent.client_secret;
                console.log("Retrieved client secret from update invoice payment intent");
              }
            } catch (retrieveError) {
              console.error("Error retrieving update invoice payment intent:", retrieveError);
            }
          }
        } catch (invoiceError: any) {
          console.error("Error creating manual invoice for subscription update:", invoiceError);
        }
      }
    } else {
      // Create a new subscription
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: customerIdToUse,
        items: [{ price: priceId }],
        metadata: {
          userId,
        },
        // Ensure we collect payment if payment method is available
        collection_method: paymentMethodId ? "charge_automatically" : "send_invoice",
        // Set a due date if we're sending an invoice
        days_until_due: paymentMethodId ? undefined : 30,
      };

      if (paymentMethodId) {
        subscriptionParams.default_payment_method = paymentMethodId;
      }

      subscription = await stripe.subscriptions.create(subscriptionParams);
      status = subscription.status;

      // Safely check for payment intent by retrieving the invoice separately if needed
      if (subscription.latest_invoice && typeof subscription.latest_invoice === "string") {
        try {
          // First, retrieve the invoice without expanding payment_intent
          const basicInvoice = await stripe.invoices.retrieve(subscription.latest_invoice);

          // Only try to expand payment_intent if the invoice status suggests it might have a payment
          if (
            basicInvoice.status === "paid" ||
            basicInvoice.status === "open" ||
            (basicInvoice as any).payment_intent ||
            (basicInvoice as any).charge
          ) {
            try {
              const invoice = (await stripe.invoices.retrieve(subscription.latest_invoice, {
                expand: ["payment_intent"],
              })) as Stripe.Response<
                Stripe.Invoice & {
                  payment_intent?: Stripe.PaymentIntent;
                }
              >;

              if (invoice.payment_intent && typeof invoice.payment_intent !== "string") {
                clientSecret = invoice.payment_intent.client_secret;
                console.log(
                  `Retrieved client secret from latest invoice: ${subscription.latest_invoice}`,
                );
              }
            } catch (expandErr: any) {
              console.log(`Could not expand payment_intent on invoice: ${expandErr.message}`);

              // Try to check if there's a payment intent ID we can use directly
              if (
                (basicInvoice as any).payment_intent &&
                typeof (basicInvoice as any).payment_intent === "string"
              ) {
                try {
                  const paymentIntent = await stripe.paymentIntents.retrieve(
                    (basicInvoice as any).payment_intent,
                  );
                  clientSecret = paymentIntent.client_secret;
                  console.log(`Retrieved client secret directly from payment intent`);
                } catch (piErr: any) {
                  console.log(`Error retrieving payment intent directly: ${piErr.message}`);
                }
              }
            }
          } else {
            console.log(
              `Invoice ${basicInvoice.id} status is ${basicInvoice.status}, skipping payment_intent expansion`,
            );
          }
        } catch (err) {
          console.log("Error accessing latest invoice:", err);
        }
      } else {
        // If no invoice was created automatically, create one manually
        console.log("No invoice found for new subscription, creating invoice manually");
        try {
          const invoice = await stripe.invoices.create({
            customer: customerIdToUse,
            subscription: subscription.id,
            auto_advance: true, // automatically finalize and attempt payment
            description: `New subscription to ${lookupKey}`,
          });

          // Finalize the invoice and attempt to collect payment if needed
          if (invoice.status === "draft" && invoice.id) {
            await stripe.invoices.finalizeInvoice(invoice.id);
            if (paymentMethodId) {
              try {
                const paidInvoice = await stripe.invoices.pay(invoice.id);
                console.log(`Invoice paid: ${paidInvoice.id}, status: ${paidInvoice.status}`);
              } catch (payError) {
                console.error("Error paying invoice:", payError);
              }
            }
          }

          console.log(
            `Manual invoice created for new subscription: ${invoice.id}, status: ${invoice.status}`,
          );

          // Try to get client secret in a safer way
          if (invoice.id) {
            try {
              // Wait a moment for Stripe to process the invoice
              await new Promise((resolve) => setTimeout(resolve, 1000));

              // Don't expand payment_intent directly to avoid errors
              const retrievedInvoice = await stripe.invoices.retrieve(invoice.id);

              // If the invoice has a payment intent, retrieve it directly
              if (
                (retrievedInvoice as any).payment_intent &&
                typeof (retrievedInvoice as any).payment_intent === "string"
              ) {
                const paymentIntent = await stripe.paymentIntents.retrieve(
                  (retrievedInvoice as any).payment_intent,
                );
                clientSecret = paymentIntent.client_secret;
                console.log("Retrieved client secret from manual invoice payment intent");
              }
            } catch (retrieveError) {
              console.error("Error retrieving manual invoice payment intent:", retrieveError);
            }
          }
        } catch (invoiceError: any) {
          console.error("Error creating manual invoice for new subscription:", invoiceError);
        }
      }
    }

    // Update user's subscription status in our database
    if (userId) {
      try {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            subscribed_to: lookupKey,
            price_id: priceId,
          })
          .eq("id", userId);

        if (updateError) {
          console.warn(`Could not update profile subscription status: ${updateError.message}`);
          // Continue with the subscription process even if we can't update the profile
        } else {
          console.log(`Updated user ${userId} subscription to plan ${lookupKey}`);
        }
      } catch (dbError) {
        console.warn(`Error updating profile subscription status: ${dbError}`);
        // Continue with the subscription process even if we can't update the profile
      }
    }

    // Check if the subscription requires additional payment or action
    if (status === "incomplete" && clientSecret) {
      return res.status(200).json({
        subscriptionId: subscription.id,
        status,
        success: false,
        clientSecret,
        requires_payment: true,
      });
    }

    const isActive = status === "active" || status === "trialing";

    return res.status(200).json({
      subscriptionId: subscription.id,
      status,
      success: true,
      isActive,
      clientSecret: null,
    });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    return res.status(500).json({
      error: "Failed to create subscription",
      message: error.message || "An unexpected error occurred",
    });
  }
}
