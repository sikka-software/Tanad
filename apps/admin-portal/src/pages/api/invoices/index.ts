import { NextApiRequest, NextApiResponse } from "next";
import { desc } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { invoices } from "@/db/schema";

// Helper to convert numeric strings to numbers
function convertInvoice(invoice: typeof invoices.$inferSelect) {
  return {
    ...invoice,
    subtotal: Number(invoice.subtotal),
    total: Number(invoice.total),
    taxRate: invoice.taxRate ? Number(invoice.taxRate) : null,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const invoicesList = await db.query.invoices.findMany({
        orderBy: desc(invoices.created_at),
      });
      return res.status(200).json(invoicesList.map(convertInvoice));
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return res.status(500).json({ message: "Error fetching invoices" });
    }
  }

  if (req.method === "POST") {
    try {
      const [invoice] = await db.insert(invoices).values(req.body).returning();
      return res.status(201).json(convertInvoice(invoice));
    } catch (error) {
      console.error("Error creating invoice:", error);
      return res.status(500).json({ message: "Error creating invoice" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
} 