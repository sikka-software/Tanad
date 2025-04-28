import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { jobListings, jobListingJobs } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient({ req, res, query: {}, resolvedUrl: "" });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user_id = user.id;
  const enterprise_id = user.app_metadata.enterprise_id;
  if (!enterprise_id) {
    return res.status(400).json({ error: "Enterprise association not found for user" });
  }

  try {
    const { title, description, jobs } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // First create the job listing
    const [newListing] = await db
      .insert(jobListings)
      .values({
        title: title.trim(),
        description: description?.trim() || null,
        is_active: true,
        slug: title.trim().toLowerCase().replace(/\s+/g, "-"),
        user_id: user_id,
        enterprise_id: enterprise_id,
      })
      .returning();

    // Then create the job associations if provided
    if (jobs && Array.isArray(jobs) && jobs.length > 0) {
      await db.insert(jobListingJobs).values(
        jobs.map((job_id: string) => ({
          job_listing_id: newListing.id,
          job_id: job_id,
          user_id: user_id,
          enterprise_id: enterprise_id,
        })),
      );
    }

    return res.status(201).json(newListing);
  } catch (error) {
    console.error("Error creating job listing:", error);
    return res.status(500).json({
      error: "Failed to create job listing",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
