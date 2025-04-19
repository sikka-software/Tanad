import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { quotes } from "@/db/schema";

// Helper to convert Drizzle quote to our Quote type
function convertDrizzleQuote(data: any): any {
  if (!data.created_at) {
    throw new Error("Quote must have a creation date");
  }

  return {
    id: data.id,
    created_at: data.created_at.toString(),
    quote_number: data.quoteNumber,
    issue_date: data.issueDate,
    expiry_date: data.expiryDate,
    subtotal: Number(data.subtotal),
    tax_rate: Number(data.taxRate),
    tax_amount: Number(data.taxAmount),
    total: Number(data.total),
    status: data.status,
    notes: data.notes || undefined,
    client_id: data.client_id,
    clients: data.client
      ? {
          id: data.client.id,
          name: data.client.name,
          company: data.client.company || "No Company",
          email: data.client.email || "",
          phone: data.client.phone,
          address: data.client.address,
          city: data.client.city,
          state: data.client.state,
          zip_code: data.client.zip_code,
          notes: data.client.notes || null,
          created_at: data.client.created_at?.toString() || "",
        }
      : undefined,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid quote ID" });
  }

  switch (req.method) {
    case "GET":
      try {
        const quote = await db.query.quotes.findFirst({
          where: eq(quotes.id, id),
          with: {
            client: true,
          },
        });
        if (!quote) {
          return res.status(404).json({ message: "Quote not found" });
        }
        return res.status(200).json(convertDrizzleQuote(quote));
      } catch (error) {
        console.error("Error fetching quote:", error);
        return res.status(500).json({ message: "Error fetching quote" });
      }

    case "PUT":
      try {
        const { quote_number, issue_date, expiry_date, status, subtotal, tax_rate, notes } =
          req.body;
        const [updatedQuote] = await db
          .update(quotes)
          .set({
            quoteNumber: quote_number,
            issueDate: issue_date,
            expiryDate: expiry_date,
            status,
            subtotal: subtotal?.toString(),
            taxRate: tax_rate?.toString(),
            notes,
          })
          .where(eq(quotes.id, id))
          .returning();
        if (!updatedQuote) {
          return res.status(404).json({ message: "Quote not found" });
        }
        return res.status(200).json(convertDrizzleQuote(updatedQuote));
      } catch (error) {
        console.error("Error updating quote:", error);
        return res.status(500).json({ message: "Error updating quote" });
      }

    case "DELETE":
      try {
        await db.delete(quotes).where(eq(quotes.id, id));
        return res.status(204).end();
      } catch (error) {
        console.error("Error deleting quote:", error);
        return res.status(500).json({ message: "Error deleting quote" });
      }

    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
