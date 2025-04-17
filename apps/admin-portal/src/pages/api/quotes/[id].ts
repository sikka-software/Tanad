import { NextApiRequest, NextApiResponse } from "next";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { quotes } from "@/db/schema";
import { Quote } from "@/types/quote.type";

// Helper to convert Drizzle quote to our Quote type
function convertDrizzleQuote(data: typeof quotes.$inferSelect & { clients?: any }): Quote {
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
    clients: data.clients
      ? {
          id: data.clients.id,
          name: data.clients.name,
          company: data.clients.company || "No Company",
          email: data.clients.email || "",
          phone: data.clients.phone,
          address: data.clients.address,
          city: data.clients.city,
          state: data.clients.state,
          zip_code: data.clients.zipCode,
          notes: data.clients.notes || null,
          created_at: data.clients.created_at?.toString() || "",
        }
      : undefined,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid quote ID" });
  }

  try {
    switch (req.method) {
      case "GET":
        const quote = await db.query.quotes.findFirst({
          where: eq(quotes.id, id),
          with: {
            client: {
              columns: {
                id: true,
                name: true,
                company: true,
                email: true,
                phone: true,
                address: true,
                city: true,
                state: true,
                zipCode: true,
                notes: true,
                created_at: true,
              },
            },
          },
        });

        if (!quote) {
          return res.status(404).json({ message: "Quote not found" });
        }

        return res.status(200).json(convertDrizzleQuote(quote));

      case "PUT":
        const [updatedQuote] = await db
          .update(quotes)
          .set(req.body)
          .where(eq(quotes.id, id))
          .returning();

        if (!updatedQuote) {
          return res.status(404).json({ message: "Quote not found" });
        }

        return res.status(200).json(convertDrizzleQuote(updatedQuote));

      case "DELETE":
        await db.delete(quotes).where(eq(quotes.id, id));
        return res.status(204).end();

      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error handling quote:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
