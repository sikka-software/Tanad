import { NextApiRequest, NextApiResponse } from "next";
import { sql } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { jobs } from "@/db/schema";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the user session from cookie
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        detail: "You must be logged in to create a job"
      });
    }

    // Get the authenticated user's ID
    const authenticatedUserId = session.user.id;

    const {
      title,
      description,
      requirements,
      location,
      department,
      type,
      salary,
      isActive,
      startDate,
      endDate,
      userId, // This may be passed from the client
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    
    if (!type) {
      return res.status(400).json({ error: "Job type is required" });
    }
    
    // Use the authenticated user ID from the session if userId is not provided
    const effectiveUserId = userId || authenticatedUserId;

    console.log("Creating job with values:", {
      title,
      description,
      requirements,
      location,
      department,
      type,
      salary: salary ? `${salary}` : null,
      isActive,
      startDate,
      endDate,
      userId: effectiveUserId
    });

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
        isActive,
        startDate,
        endDate,
        userId: effectiveUserId, // Use the authenticated user ID
      })
      .returning();

    return res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    // Provide more detailed error information
    return res.status(500).json({ 
      error: "Failed to create job", 
      details: error instanceof Error ? error.message : "Unknown error",
      hint: "This could be due to Row Level Security policies. Make sure you're properly authenticated." 
    });
  }
}
