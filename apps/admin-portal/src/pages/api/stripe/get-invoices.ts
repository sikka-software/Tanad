import { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";

import { getStripeInstance } from "@/lib/stripe-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stripe = await getStripeInstance();
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    // Get invoices for the customer
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 25, // Increased limit to show more invoices
      // Removed status filter to show all invoices
    });

    // Map the invoices to include the PDF URL and formatted data
    const formattedInvoices = invoices.data.map((invoice: Stripe.Invoice) => {
      // Format the data for frontend display
      return {
        id: invoice.id,
        number: invoice.number || invoice.id,
        date: new Date(invoice.created * 1000).toISOString(),
        amount: `${(invoice.total / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`,
        status: invoice.status,
        planName: invoice.lines.data[0]?.description || "Unknown Plan",
        pdfUrl: invoice.invoice_pdf,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
      };
    });

    return res.status(200).json({
      invoices: formattedInvoices,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}
