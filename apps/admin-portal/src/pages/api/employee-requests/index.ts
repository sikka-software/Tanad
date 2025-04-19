import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { employeeRequests } from "@/db/schema";
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

      const result = await db
        .select()
        .from(employeeRequests)
        .where(eq(employeeRequests.user_id, user?.id));
      return res.status(200).json({ requests: result });
    } catch (error) {
      console.error("Error fetching employee requests:", error);
      return res.status(500).json({ error: "Failed to fetch employee requests" });
    }
  }

  if (req.method === "POST") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    try {
      const result = await db
        .insert(employeeRequests)
        .values({ ...req.body, user_id: user?.id })
        .returning();
      return res.status(201).json(result[0]);
    } catch (error) {
      console.error("Error creating employee request:", error);
      return res.status(500).json({ error: "Failed to create employee request" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
