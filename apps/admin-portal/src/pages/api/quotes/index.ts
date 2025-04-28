import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { quotes } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

// Helper to convert Drizzle quote to our Quote type
function convertDrizzleQuote(data: any): any {
  if (!data.created_at) {
    throw new Error("Quote must have a creation date");
  }

  return {
    id: data.id,
    created_at: data.created_at.toString(),
    quote_number: data.quote_number,
    issue_date: data.issue_date,
    expiry_date: data.expiry_date,
    subtotal: Number(data.subtotal),
    tax_rate: Number(data.tax_rate),
    tax_amount: Number(data.tax_amount),
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
  const supabase = createClient({
    req,
    res,
    query: {},
    resolvedUrl: "",
  });
  switch (req.method) {
    case "GET":
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.id) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const result = await db.query.quotes.findMany({
          where: eq(quotes.user_id, user?.id),
          with: {
            client: true,
          },
        });
        const data = result.map(convertDrizzleQuote);
        return res.status(200).json(data);
      } catch (error) {
        console.error("Error fetching quotes:", error);
        return res.status(500).json({ message: "Error fetching quotes" });
      }

    case "POST":
      try {
        const {
          quote_number,
          issue_date,
          expiry_date,
          status,
          subtotal,
          tax_rate,
          notes,
          client_id,
          user_id,
        } = req.body;
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user?.id) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const [newQuote] = await db
          .insert(quotes)
          .values({
            enterprise_id: user.app_metadata.enterprise_id,
            quote_number: quote_number,
            issue_date: issue_date,
            expiry_date: expiry_date,
            status,
            subtotal: subtotal.toString(),
            tax_rate: tax_rate.toString(),
            notes,
            client_id: client_id,
            user_id,
          })
          .returning();
        if (!newQuote) {
          return res.status(400).json({ message: "Failed to create quote" });
        }
        return res.status(201).json(convertDrizzleQuote(newQuote));
      } catch (error) {
        console.error("Error creating quote:", error);
        return res.status(500).json({ message: "Error creating quote" });
      }

    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
