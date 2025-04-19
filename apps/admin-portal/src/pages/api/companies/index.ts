import { eq, desc, inArray } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { companies } from "@/db/schema";
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
      const companiesList = await db.query.companies.findMany({
        where: eq(companies.user_id, user?.id),
        orderBy: desc(companies.created_at),
      });
      return res.status(200).json(companiesList);
    } catch (error) {
      console.error("Error fetching companies:", error);
      return res.status(500).json({ message: "Error fetching companies" });
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
      const dbCompany = {
        ...req.body,
        user_id: user?.id,
      };

      const [company] = await db.insert(companies).values(dbCompany).returning();
      return res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      return res.status(500).json({ message: "Error creating company" });
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
        return res.status(400).json({ message: "Invalid company IDs" });
      }

      await db.delete(companies).where(inArray(companies.id, ids));
      return res.status(204).end();
    } catch (error) {
      console.error("Error bulk deleting companies:", error);
      return res.status(500).json({ message: "Error bulk deleting companies" });
    }
  }
}
