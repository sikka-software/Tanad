import { NextApiRequest, NextApiResponse } from "next";

import { desc } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { quotes } from "@/db/schema";
import { Quote } from "@/types/quote.type";

// Helper to convert Drizzle quote to our Quote type
function convertDrizzleQuote(data: typeof quotes.$inferSelect & { clients?: any }): Quote {
  if (!data.createdAt) {
    throw new Error("Quote must have a creation date");
  }

  return {
    id: data.id,
    created_at: data.createdAt.toString(),
    quote_number: data.quoteNumber,
    issue_date: data.issueDate,
    expiry_date: data.expiryDate,
    subtotal: Number(data.subtotal),
    tax_rate: Number(data.taxRate),
    tax_amount: Number(data.taxAmount),
    total: Number(data.total),
    status: data.status,
    notes: data.notes || undefined,
    client_id: data.clientId,
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
          created_at: data.clients.createdAt?.toString() || "",
        }
      : undefined,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET":
        const data = await db.query.quotes.findMany({
          with: {
            clients: {
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
                createdAt: true,
              },
            },
          },
          orderBy: desc(quotes.createdAt),
        });
        return res.status(200).json(data.map(convertDrizzleQuote));

      case "POST":
        const [newQuote] = await db.insert(quotes).values(req.body).returning();
        if (!newQuote) {
          return res.status(400).json({ message: "Failed to create quote" });
        }
        return res.status(201).json(convertDrizzleQuote(newQuote));

      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error handling quotes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
