import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { jobListings } from "@/db/schema";
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
    return res.status(400).json({ error: "Invalid job listing ID" });
  }

  if (req.method === "PUT") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // First check if the job listing belongs to the user
      const existingListing = await db.select().from(jobListings).where(eq(jobListings.id, id));

      if (!existingListing.length) {
        return res.status(404).json({ error: "Job listing not found" });
      }

      // Check if the job listing belongs to the user
      if (existingListing[0].user_id !== user.id) {
        return res.status(403).json({ error: "Not authorized to update this job listing" });
      }

      const result = await db
        .update(jobListings)
        .set(req.body)
        .where(eq(jobListings.id, id))
        .returning();

      return res.status(200).json(result[0]);
    } catch (error) {
      console.error(`Error updating job listing ${id}:`, error);
      return res.status(500).json({ error: "Failed to update job listing" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
