import { desc, eq } from "drizzle-orm";
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
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const requestsList = await db
      .select()
      .from(employeeRequests)
      .where(eq(employeeRequests.user_id, user?.id))
      .orderBy(desc(employeeRequests.created_at));

    return res.status(200).json({ requests: requestsList });
  } catch (error) {
    console.error("Error fetching employee requests:", error);
    return res.status(500).json({ error: "Failed to fetch employee requests" });
  }
}
