import type { NextApiRequest, NextApiResponse } from "next";

import { getStripeInstance } from "@/lib/stripe-admin";
import { supabase } from "@/lib/supabase";

/**
 * API endpoint to fetch billing history/invoices from Stripe
 *
 * @param req.body.customerId - The Stripe customer ID (optional if userId is provided)
 * @param req.body.userId - The user ID in the database (optional if customerId is provided)
 * @param req.body.limit - Maximum number of invoices to return (default: 10)
 * @param req.body.includeDrafts - Whether to include draft invoices (default: false)
 *
 * @returns {Object} Response object with invoices and metadata
 * @returns {Array} response.invoices - List of invoices
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stripe = getStripeInstance();
    const { customerId, userId, limit = 10, includeDrafts = false } = req.body;

    // Either need a customer ID or user ID
    if (!customerId && !userId) {
      return res.status(400).json({
        error: "Missing required parameters",
        message: "Either Customer ID or User ID is required",
      });
    }

    // Get customer info if we have userId but no customerId
    let customerIdToUse = customerId;
    if (!customerIdToUse && userId) {
      console.log(`Looking up customer ID for user: ${userId}`);

      // Try to find the profile with retries
      let retryCount = 0;
      const maxRetries = 3;
      let profileFound = false;
      let profile = null;

      while (retryCount < maxRetries && !profileFound) {
        // If this is a retry, wait before trying again
        if (retryCount > 0) {
          console.log(`Retry ${retryCount}/${maxRetries} finding user profile, waiting...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("stripe_customer_id, email")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) {
          console.error(
            `Attempt ${retryCount + 1}/${maxRetries} - Error finding user profile:`,
            profileError,
          );
          retryCount++;
        } else if (profileData) {
          profileFound = true;
          profile = profileData;
          console.log(`Found user profile:`, profileData);

          if (profile.stripe_customer_id) {
            console.log(`Found existing stripe customer ID: ${profile.stripe_customer_id}`);
            customerIdToUse = profile.stripe_customer_id;
          }
        } else {
          console.log(
            `Profile not found for user ${userId}, retry ${retryCount + 1}/${maxRetries}`,
          );
          retryCount++;
        }
      }

      if (!customerIdToUse) {
        console.log(`No customer ID found for user ${userId} after ${maxRetries} attempts`);
        // No customer ID found, return empty history
        return res.status(200).json({ invoices: [] });
      }
    }

    console.log(`Fetching invoices for customer: ${customerIdToUse}`);

    // Fetch invoices from Stripe with error handling
    let allInvoices = [];
    try {
      // First, get paid invoices
      const paidInvoices = await stripe.invoices.list({
        customer: customerIdToUse,
        limit: Number(limit),
        expand: ["data.subscription", "data.lines.data.price.product", "data.payment_intent"],
        status: "paid",
      });

      console.log(
        `Found ${paidInvoices.data.length} paid invoices for customer ${customerIdToUse}`,
      );
      allInvoices = [...paidInvoices.data];

      // If requested or if no paid invoices, get open invoices too
      if (paidInvoices.data.length === 0 || includeDrafts) {
        const openInvoices = await stripe.invoices.list({
          customer: customerIdToUse,
          limit: Number(limit),
          expand: ["data.subscription", "data.lines.data.price.product", "data.payment_intent"],
          status: "open",
        });

        console.log(
          `Found ${openInvoices.data.length} open invoices for customer ${customerIdToUse}`,
        );
        allInvoices = [...allInvoices, ...openInvoices.data];
      }

      // If requested, include draft invoices
      if (includeDrafts) {
        const draftInvoices = await stripe.invoices.list({
          customer: customerIdToUse,
          limit: Number(limit),
          expand: ["data.subscription", "data.lines.data.price.product", "data.payment_intent"],
          status: "draft",
        });

        console.log(
          `Found ${draftInvoices.data.length} draft invoices for customer ${customerIdToUse}`,
        );
        allInvoices = [...allInvoices, ...draftInvoices.data];
      }
    } catch (stripeError: any) {
      console.error("Error fetching invoices from Stripe:", stripeError);
      // Return an empty list rather than failing completely
      return res.status(200).json({
        invoices: [],
        error: stripeError.message,
      });
    }

    // Filter and sort by creation date (newest first)
    const filteredInvoices = allInvoices.sort((a, b) => b.created - a.created);

    // Format invoice data for the frontend
    const formattedInvoices = filteredInvoices.map((invoice) => {
      // Get the plan name from the invoice line items
      let planName = "Unknown Plan";

      if (invoice.lines.data.length > 0) {
        const lineItem = invoice.lines.data[0] as any;
        if (lineItem.price?.product && typeof lineItem.price.product !== "string") {
          planName = lineItem.price.product.name;
        }
      }

      // Format the invoice amount
      const amount = invoice.amount_paid
        ? `${(invoice.amount_paid / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`
        : invoice.amount_due
          ? `${(invoice.amount_due / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`
          : "0.00";

      // Use type assertion for invoice to access subscription
      const typedInvoice = invoice as any;

      // Get detailed payment status with proper string typing for all possible status values
      let detailedStatus: string = invoice.status || "unknown";
      if (typedInvoice.paid) {
        detailedStatus = "paid";
      } else if (invoice.status === "open") {
        detailedStatus =
          invoice.due_date && invoice.due_date * 1000 < Date.now() ? "overdue" : "pending";
      }

      return {
        id: invoice.id,
        number: invoice.number || invoice.id,
        date: new Date(invoice.created * 1000).toISOString(),
        dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
        amount: amount,
        status: detailedStatus,
        originalStatus: invoice.status,
        planName: planName,
        // Include URL to invoice PDF if available
        pdfUrl: invoice.invoice_pdf,
        // Include subscription data if available
        subscriptionId:
          typeof typedInvoice.subscription === "string"
            ? typedInvoice.subscription
            : typedInvoice.subscription?.id,
        // Include payment status details
        paid: typedInvoice.paid,
        amountPaid: invoice.amount_paid > 0 ? (invoice.amount_paid / 100).toFixed(2) : "0.00",
        amountDue: invoice.amount_due > 0 ? (invoice.amount_due / 100).toFixed(2) : "0.00",
        amountRemaining:
          invoice.amount_remaining > 0 ? (invoice.amount_remaining / 100).toFixed(2) : "0.00",
        currency: invoice.currency.toUpperCase(),
      };
    });

    return res.status(200).json({
      invoices: formattedInvoices,
    });
  } catch (error: any) {
    console.error("Error fetching billing history:", error);
    return res.status(500).json({
      error: "Failed to fetch billing history",
      message: error.message || "An unexpected error occurred",
    });
  }
}
