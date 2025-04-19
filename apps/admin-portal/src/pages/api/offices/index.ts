import { eq, desc } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { offices } from "@/db/schema";
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
      const officesList = await db.query.offices.findMany({
        where: eq(offices.user_id, user?.id),
        orderBy: desc(offices.created_at),
      });

      return res.status(200).json(officesList);
    } catch (error) {
      console.error("Error fetching offices:", error);
      return res.status(500).json({ error: "Failed to fetch offices" });
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

      const [office] = await db
        .insert(offices)
        .values({ ...req.body, user_id: user.id })
        .returning();

      return res.status(201).json(office);
    } catch (error) {
      console.error("Error creating office:", error);
      return res.status(500).json({ error: "Failed to create office" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
