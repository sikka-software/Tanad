import { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";

import { getStripeInstance } from "@/lib/stripe-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stripe = await getStripeInstance();
    const { customerId, forceRefresh = false } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    // Set cache control headers to avoid browser caching
    res.setHeader("Cache-Control", "no-store, max-age=0");

    // Get invoices for the customer
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 25, // Increased limit to show more invoices
      // Use expanded limit if forcing refresh to ensure we get the latest
      ...(forceRefresh ? { limit: 50 } : {}),
    });

    // Map the invoices to include the PDF URL and formatted data
    const formattedInvoices = invoices.data.map((invoice: Stripe.Invoice) => {
      // Try to get better plan information from the invoice
      let planName = "Unknown Plan";
      let planType = "";

      if (invoice.lines && invoice.lines.data && invoice.lines.data.length > 0) {
        const lineItem = invoice.lines.data[0];

        // Try to extract plan information
        planName = lineItem.description || "";

        // Check for plan metadata if available
        // Use type assertion for Stripe-specific properties that might exist
        const anyLineItem = lineItem as any;
        if (anyLineItem.plan && anyLineItem.plan.metadata) {
          if (anyLineItem.plan.metadata.plan_name) {
            planName = anyLineItem.plan.metadata.plan_name;
          }
          if (anyLineItem.plan.metadata.plan_type) {
            planType = anyLineItem.plan.metadata.plan_type;
          }
        }

        // Try to get plan from product if available
        if (
          anyLineItem.price &&
          anyLineItem.price.product &&
          typeof anyLineItem.price.product !== "string"
        ) {
          const product = anyLineItem.price.product;
          if (product.name) {
            planName = product.name;
          }

          // Check product metadata
          if (product.metadata) {
            if (product.metadata.plan_name) {
              planName = product.metadata.plan_name;
            }
            if (product.metadata.plan_type) {
              planType = product.metadata.plan_type;
            }
          }
        }
      }

      // Include the price in the plan name if we have it and not already included
      const priceAmount = (invoice.total / 100).toFixed(2);
      if (!planName.includes(priceAmount)) {
        planName = `${planName} (${priceAmount} ${invoice.currency.toUpperCase()})`;
      }

      // Format the data for frontend display
      return {
        id: invoice.id,
        number: invoice.number || invoice.id,
        date: new Date(invoice.created * 1000).toISOString(),
        amount: `${(invoice.total / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`,
        status: invoice.status,
        planName: planName,
        planType: planType,
        pdfUrl: invoice.invoice_pdf,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        // Include raw data for debugging if needed
        rawDescription: invoice.lines.data[0]?.description,
      };
    });

    return res.status(200).json({
      invoices: formattedInvoices,
      timestamp: Date.now(), // Add timestamp to help with cache-busting
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}
