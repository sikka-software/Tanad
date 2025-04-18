import { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { clients } from "@/db/schema";
import { Client } from "@/types/client.type";

// Helper to convert Drizzle client to our Client type
function convertDrizzleClient(data: typeof clients.$inferSelect): Client {
  return {
    id: data.id,
    name: data.name,
    email: data.email || "",
    phone: data.phone,
    company: data.company || "",
    address: data.address,
    city: data.city,
    state: data.state,
    zip_code: data.zipCode,
    notes: data.notes,
    created_at: data.created_at?.toString() || "",
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const client = await db.query.clients.findFirst({
        where: eq(clients.id, id as string),
      });

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      return res.status(200).json(convertDrizzleClient(client));
    } catch (error) {
      console.error("Error fetching client:", error);
      return res.status(500).json({ message: "Error fetching client" });
    }
  }

  if (req.method === "PUT") {
    try {
      // Convert snake_case to camelCase if zip_code is provided
      const dbClient = req.body.zip_code
        ? {
            ...req.body,
            zipCode: req.body.zip_code,
          }
        : req.body;

      const [client] = await db
        .update(clients)
        .set(dbClient)
        .where(eq(clients.id, id as string))
        .returning();

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      return res.status(200).json(convertDrizzleClient(client));
    } catch (error) {
      console.error("Error updating client:", error);
      return res.status(500).json({ message: "Error updating client" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await db.delete(clients).where(eq(clients.id, id as string));
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting client:", error);
      return res.status(500).json({ message: "Error deleting client" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
} 