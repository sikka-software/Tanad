import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { clients } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const supabase = createClient({
    req,
    res,
    query: {},
    resolvedUrl: "",
  });

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid job listing ID" });
  }

  if (req.method === "GET") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const client = await db.query.clients.findFirst({
        where: eq(clients.id, id as string),
      });

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      return res.status(200).json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      return res.status(500).json({ message: "Error fetching client" });
    }
  }

  if (req.method === "PUT") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const existingClient = await db.query.clients.findFirst({
        where: eq(clients.id, id as string),
      });

      if (!existingClient) {
        return res.status(404).json({ message: "Client not found" });
      }

      if (existingClient.user_id !== user.id) {
        return res.status(403).json({ error: "Not authorized to update this client" });
      }

      const dbClient = {
        ...req.body,
        zip_code: req.body.zip_code,
        is_active: req.body.is_active,
      };

      const [client] = await db
        .update(clients)
        .set(dbClient)
        .where(eq(clients.id, id as string))
        .returning();

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      return res.status(200).json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      return res.status(500).json({ message: "Error updating client" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const supabase = createClient({
        req,
        res,
        query: {},
        resolvedUrl: "",
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        return res
          .status(401)
          .json({ message: "Unauthorized, you must be logged in to delete a client" });
      }

      await db.delete(clients).where(eq(clients.id, id as string));
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting client:", error);
      return res.status(500).json({ message: "Error deleting client" });
    }
  }

  return res
    .status(405)
    .json({ message: "Method not allowed, only GET, PUT and DELETE are allowed" });
}
