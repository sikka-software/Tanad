import { NextApiRequest, NextApiResponse } from "next";

import { desc } from "drizzle-orm";

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
          zip_code: data.client.zipCode,
          notes: data.client.notes || null,
          created_at: data.client.created_at?.toString() || "",
        }
      : undefined,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET":
        const result = await db.query.quotes.findMany({
          with: {
            client: true,
          },
          orderBy: [desc(quotes.created_at)],
        });

        const data = result.map(convertDrizzleQuote);
        return res.status(200).json(data);

      case "POST":
        const [newQuote] = await db.insert(quotes).values(req.body).returning();
        if (!newQuote) {
          return res.status(400).json({ message: "Failed to create quote" });
        }
        return res.status(201).json(newQuote);

      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error handling quotes:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
