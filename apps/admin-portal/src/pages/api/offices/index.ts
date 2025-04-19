import { eq } from "drizzle-orm";
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const result = await db.query.offices.findMany({
        where: eq(offices.user_id, user?.id),
      });
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching offices:", error);
      return res.status(500).json({ error: "Failed to fetch offices" });
    }
  }

  if (req.method === "POST") {
    try {
      const dbOffice = {
        ...req.body,
        user_id: user?.id,
      };

      const result = await db.insert(offices).values(dbOffice).returning();
      return res.status(201).json(result[0]);
    } catch (error) {
      console.error("Error creating office:", error);
      return res.status(500).json({ error: "Failed to create office" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
