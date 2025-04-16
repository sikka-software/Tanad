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
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", userId)
        .single();

      if (profile?.stripe_customer_id) {
        customerIdToUse = profile.stripe_customer_id;
      } else {
        // No customer ID found, return empty history
        return res.status(200).json({ invoices: [] });
      }
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: customerIdToUse,
      limit: Number(limit),
      expand: ["data.subscription", "data.lines.data.price.product", "data.payment_intent"],
    });

    console.log(`Found ${invoices.data.length} invoices for customer ${customerIdToUse}`);

    // Filter out draft invoices if needed and sort by creation date (newest first)
    const filteredInvoices = invoices.data
      .filter((invoice) => includeDrafts || invoice.status !== "draft")
      .sort((a, b) => b.created - a.created);

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
