import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { jobs } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const supabase = createClient({
    req,
    res,
    query: {},
    resolvedUrl: "",
  });

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid job ID" });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const result = await db.query.jobs.findFirst({
        where: eq(jobs.id, id as string),
      });

      if (!result) {
        return res.status(404).json({ error: "Job not found" });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      return res.status(500).json({ error: "Failed to fetch job" });
    }
  }

  if (req.method === "PUT") {
    try {
      const existingJob = await db.query.jobs.findFirst({
        where: eq(jobs.id, id as string),
      });

      if (!existingJob) {
        return res.status(404).json({ error: "Job not found" });
      }

      if (existingJob.user_id !== user.id) {
        return res.status(403).json({ error: "Not authorized to update this job" });
      }

      const dbJob = {
        ...req.body,
        is_active: req.body.is_active,
      };

      const [result] = await db
        .update(jobs)
        .set(dbJob)
        .where(eq(jobs.id, id as string))
        .returning();

      if (!result) {
        return res.status(404).json({ error: "Job not found" });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`Error updating job ${id}:`, error);
      return res.status(500).json({ error: "Failed to update job" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await db.delete(jobs).where(eq(jobs.id, id as string));

      return res.status(204).end();
    } catch (error) {
      console.error(`Error deleting job ${id}:`, error);
      return res.status(500).json({ error: "Failed to delete job" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
