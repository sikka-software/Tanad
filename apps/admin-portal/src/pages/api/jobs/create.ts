import { NextApiRequest, NextApiResponse } from "next";

import { sql } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { jobs } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log the full request for debugging
  console.log("Full request body received:", JSON.stringify(req.body, null, 2));

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      title,
      description,
      requirements,
      location,
      department,
      type,
      salary,
      is_active,
      startDate,
      endDate,
      user_id, // Try to get alternative field name too
    } = req.body;

    // Get the user ID - try both camelCase and snake_case versions
    const effectiveuser_id = user_id || user_id;

    console.log("Extracted user_id:", user_id);
    console.log("Extracted user_id:", user_id);
    console.log("Effective user ID:", effectiveuser_id);

    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!type) {
      return res.status(400).json({ error: "Job type is required" });
    }

    // Validate user_id
    if (!effectiveuser_id) {
      return res.status(400).json({
        error: "User ID is required",
        detail: "The user_id field is needed to satisfy the RLS policy",
        requestBody: req.body, // Include the request body for debugging
      });
    }

    console.log("Creating job with values:", {
      title,
      description,
      requirements,
      location,
      department,
      type,
      salary: salary ? `${salary}` : null,
      is_active,
      startDate,
      endDate,
      user_id: effectiveuser_id,
    });

    // Insert using user_id field name to match the database column
    const [job] = await db
      .insert(jobs)
      .values({
        title,
        description,
        requirements,
        location,
        department,
        type,
        salary: salary ? sql`${salary}::numeric` : null,
        is_active,
        startDate,
        endDate,
        user_id: effectiveuser_id, // This should work with Supabase RLS
      })
      .returning();

    return res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    return res.status(500).json({
      error: "Failed to create job",
      details: error instanceof Error ? error.message : "Unknown error",
      hint: "This could be due to Row Level Security policies. Make sure you're properly authenticated.",
    });
  }
}
