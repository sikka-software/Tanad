import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db/drizzle";
import { jobListings } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user_id = req.headers["x-user-id"] as string;
  if (!user_id) {
    return res.status(401).json({ error: "User ID is required" });
  }

  if (req.method === "GET") {
    try {
      const listings = await db
        .select()
        .from(jobListings)
        .where(eq(jobListings.user_id, user_id));

      return res.status(200).json(listings);
    } catch (error) {
      console.error("Error fetching job listings:", error);
      return res.status(500).json({
        error: "Failed to fetch job listings",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
} 