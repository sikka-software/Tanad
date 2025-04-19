import { desc, eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { branches } from "@/db/schema";
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
      const branchesList = await db.query.branches.findMany({
        where: eq(branches.user_id, user?.id),
        orderBy: desc(branches.created_at),
      });
      return res.status(200).json(branchesList);
    } catch (error) {
      console.error("Error fetching branches:", error);
      return res.status(500).json({ message: "Error fetching branches" });
    }
  }

  if (req.method === "POST") {
    try {
      // Map branch data to match Drizzle schema
      const dbBranch = {
        ...req.body,
        zip_code: req.body.zip_code,
        is_active: req.body.is_active,
      };

      const [branch] = await db.insert(branches).values(dbBranch).returning();
      return res.status(201).json(branch);
    } catch (error) {
      console.error("Error creating branch:", error);
      return res.status(500).json({ message: "Error creating branch" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
