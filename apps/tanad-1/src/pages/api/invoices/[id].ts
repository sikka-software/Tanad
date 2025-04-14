import { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";

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
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const invoice = await db.query.invoices.findFirst({
        where: eq(invoices.id, id as string),
      });

      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      return res.status(200).json(convertInvoice(invoice));
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return res.status(500).json({ message: "Error fetching invoice" });
    }
  }

  if (req.method === "PUT") {
    try {
      const [invoice] = await db
        .update(invoices)
        .set(req.body)
        .where(eq(invoices.id, id as string))
        .returning();

      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      return res.status(200).json(convertInvoice(invoice));
    } catch (error) {
      console.error("Error updating invoice:", error);
      return res.status(500).json({ message: "Error updating invoice" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await db.delete(invoices).where(eq(invoices.id, id as string));
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      return res.status(500).json({ message: "Error deleting invoice" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
} 