import { eq } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { profiles } from "@/db/schema";

type Data = {
  profile?: any;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { profile_id } = req.query;

    if (!profile_id || typeof profile_id !== "string") {
      return res.status(400).json({ error: "Profile ID is required" });
    }

    const profileData = await db.query.profiles.findFirst({
      where: eq(profiles.id, profile_id),
    });

    if (!profileData) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Remove any sensitive information before returning
    const { ...safeProfile } = profileData;

    return res.status(200).json({ profile: safeProfile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error fetching profile information",
    });
  }
}
