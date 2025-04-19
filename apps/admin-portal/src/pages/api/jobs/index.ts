import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { jobs } from "@/db/schema";
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
      const result = await db.select().from(jobs).where(eq(jobs.user_id, user?.id));
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return res.status(500).json({ error: "Failed to fetch jobs" });
    }
  }

  if (req.method === "POST") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    try {
      const result = await db
        .insert(jobs)
        .values({ ...req.body, user_id: user?.id })
        .returning();
      return res.status(201).json(result[0]);
    } catch (error) {
      console.error("Error creating job:", error);
      return res.status(500).json({ error: "Failed to create job" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
