import { NextApiRequest, NextApiResponse } from "next";

import createClient from "@/utils/supabase/api";

import { generateZatcaQRString } from "@/lib/zatca/zatca-utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the invoice data from the request body
    const { invoiceId, stripeInvoiceId } = req.body;

    if (!invoiceId && !stripeInvoiceId) {
      return res.status(400).json({ error: "Either invoiceId or stripeInvoiceId is required" });
    }

    // Get the Supabase client
    const supabase = createClient(req, res);

    // Get user info from session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user profile to get ZATCA settings
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    // Check if ZATCA is enabled in profile settings
    const zatcaEnabled = profile?.settings?.zatca_enabled ?? false;
    if (!zatcaEnabled) {
      return res.status(400).json({ error: "ZATCA compliance is not enabled" });
    }

    // Get the seller name and VAT number from profile settings
    const sellerName = profile?.settings?.zatca_seller_name ?? profile?.enterprise_name ?? "";
    const vatNumber = profile?.settings?.zatca_vat_number ?? "";

    if (!sellerName || !vatNumber) {
      return res.status(400).json({ error: "ZATCA seller name and VAT number are required" });
    }

    let invoiceData;

    // Get invoice data based on the provided ID type
    if (invoiceId) {
      // Get invoice from database
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .single();

      if (invoiceError) {
        console.error("Error fetching invoice:", invoiceError);
        return res.status(500).json({ error: "Failed to fetch invoice" });
      }

      invoiceData = {
        total: invoice.total,
        vatAmount: invoice.tax_amount || invoice.subtotal * (invoice.tax_rate / 100),
        timestamp: invoice.issue_date,
      };
    } else {
      // For Stripe invoices, we need to fetch from Stripe API
      // This is a simplified example - you'd need to use the Stripe SDK
      // to get the actual invoice data from Stripe

      // For now, we'll return a 501 Not Implemented
      return res.status(501).json({ error: "Stripe invoice QR generation not implemented yet" });

      // In a real implementation, you'd do something like:
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      // const stripeInvoice = await stripe.invoices.retrieve(stripeInvoiceId);
      // invoiceData = {
      //   total: stripeInvoice.total / 100, // Stripe amounts are in cents
      //   vatAmount: stripeInvoice.tax / 100,
      //   timestamp: new Date(stripeInvoice.created * 1000).toISOString()
      // };
    }

    // Generate the QR code string
    const qrString = generateZatcaQRString({
      sellerName,
      vatNumber,
      invoiceTimestamp: invoiceData.timestamp,
      invoiceTotal: invoiceData.total,
      vatAmount: invoiceData.vatAmount,
    });

    // Return the QR code string
    return res.status(200).json({ qrString });
  } catch (error) {
    console.error("Error generating ZATCA QR code:", error);
    return res.status(500).json({ error: "Failed to generate ZATCA QR code" });
  }
}
