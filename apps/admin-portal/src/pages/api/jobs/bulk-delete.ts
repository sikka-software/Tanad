import { inArray } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { jobs } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ids } = req.body;

  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({ error: "Invalid job IDs" });
  }

  try {
    await db.delete(jobs).where(inArray(jobs.id, ids));
    return res.status(204).end();
  } catch (error) {
    console.error("Error bulk deleting jobs:", error);
    return res.status(500).json({ error: "Failed to delete jobs" });
  }
}
