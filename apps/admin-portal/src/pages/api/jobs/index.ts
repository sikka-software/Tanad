import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { jobs } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const result = await db.select().from(jobs);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return res.status(500).json({ error: "Failed to fetch jobs" });
    }
  }

  if (req.method === "POST") {
    try {
      const result = await db.insert(jobs).values(req.body).returning();
      return res.status(201).json(result[0]);
    } catch (error) {
      console.error("Error creating job:", error);
      return res.status(500).json({ error: "Failed to create job" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
