import { eq, desc, inArray } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { clients } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient({
    req,
    res,
    query: {},
    resolvedUrl: "",
  });
  if (req.method === "GET") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const clientsList = await db.query.clients.findMany({
        where: eq(clients.user_id, user?.id),
        orderBy: desc(clients.created_at),
      });
      return res.status(200).json(clientsList);
    } catch (error) {
      console.error("Error fetching clients:", error);
      return res.status(500).json({ message: "Error fetching clients" });
    }
  }

  if (req.method === "POST") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      // Map client data to match Drizzle schema
      const dbClient = {
        ...req.body,
        user_id: user?.id,
      };

      const [client] = await db.insert(clients).values(dbClient).returning();
      return res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      return res.status(500).json({ message: "Error creating client" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid client IDs" });
      }

      await db.delete(clients).where(inArray(clients.id, ids));
      return res.status(204).end();
    } catch (error) {
      console.error("Error bulk deleting clients:", error);
      return res.status(500).json({ message: "Error bulk deleting clients" });
    }
  }
}
