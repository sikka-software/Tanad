import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { jobs } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid job ID" });
  }

  if (req.method === "GET") {
    try {
      const result = await db.select().from(jobs).where(eq(jobs.id, id));

      if (!result.length) {
        return res.status(404).json({ error: "Job not found" });
      }

      return res.status(200).json(result[0]);
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      return res.status(500).json({ error: "Failed to fetch job" });
    }
  }

  if (req.method === "PUT") {
    try {
      const result = await db.update(jobs).set(req.body).where(eq(jobs.id, id)).returning();

      if (!result.length) {
        return res.status(404).json({ error: "Job not found" });
      }

      return res.status(200).json(result[0]);
    } catch (error) {
      console.error(`Error updating job ${id}:`, error);
      return res.status(500).json({ error: "Failed to update job" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const result = await db.delete(jobs).where(eq(jobs.id, id)).returning();

      if (!result.length) {
        return res.status(404).json({ error: "Job not found" });
      }

      return res.status(204).end();
    } catch (error) {
      console.error(`Error deleting job ${id}:`, error);
      return res.status(500).json({ error: "Failed to delete job" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
