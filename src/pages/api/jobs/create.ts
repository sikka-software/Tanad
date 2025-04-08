import { NextApiRequest, NextApiResponse } from "next";

import { sql } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { jobs } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
      isActive,
      startDate,
      endDate,
      userId, // This would be passed from the client based on the authenticated user
    } = req.body;

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
        userId,
      })
      .returning();

    return res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    return res.status(500).json({ error: "Failed to create job" });
  }
} 