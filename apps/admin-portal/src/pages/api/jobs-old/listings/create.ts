import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { jobListings, jobListingJobs } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user_id = req.headers["x-user-id"] as string;
  if (!user_id) {
    return res.status(401).json({ error: "User ID is required" });
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
      })
      .returning();

    // Then create the job associations if provided
    if (jobs && Array.isArray(jobs) && jobs.length > 0) {
      await db.insert(jobListingJobs).values(
        jobs.map((job_id: string) => ({
          job_listing_id: newListing.id,
          job_id: job_id,
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
