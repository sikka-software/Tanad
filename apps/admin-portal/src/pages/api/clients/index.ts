import { NextApiRequest, NextApiResponse } from "next";

import { desc } from "drizzle-orm";

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
  if (req.method === "GET") {
    try {
      const clientsList = await db.query.clients.findMany({
        orderBy: desc(clients.created_at),
      });
      return res.status(200).json(clientsList.map(convertDrizzleClient));
    } catch (error) {
      console.error("Error fetching clients:", error);
      return res.status(500).json({ message: "Error fetching clients" });
    }
  }

  if (req.method === "POST") {
    try {
      // Map client data to match Drizzle schema
      const dbClient = {
        ...req.body,
        zipCode: req.body.zip_code,
      };

      const [client] = await db.insert(clients).values(dbClient).returning();
      return res.status(201).json(convertDrizzleClient(client));
    } catch (error) {
      console.error("Error creating client:", error);
      return res.status(500).json({ message: "Error creating client" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
