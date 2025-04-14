import { NextApiRequest, NextApiResponse } from "next";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { jobs } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const jobsList = await db.select().from(jobs).orderBy(desc(jobs.createdAt));

    return res.status(200).json({ jobs: jobsList });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
} 