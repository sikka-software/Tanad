import { NextApiRequest, NextApiResponse } from "next";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { employeeRequests } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const requestsList = await db
      .select()
      .from(employeeRequests)
      .orderBy(desc(employeeRequests.created_at));

    return res.status(200).json({ requests: requestsList });
  } catch (error) {
    console.error("Error fetching employee requests:", error);
    return res.status(500).json({ error: "Failed to fetch employee requests" });
  }
} 