import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db/drizzle";
import { jobListings } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    return res.status(401).json({ error: "User ID is required" });
  }

  if (req.method === "GET") {
    try {
      const listings = await db
        .select()
        .from(jobListings)
        .where(eq(jobListings.userId, userId));

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