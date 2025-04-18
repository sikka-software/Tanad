import type { NextApiRequest, NextApiResponse } from "next";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { profiles } from "@/db/schema";

type Data = {
  profile?: any;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "PUT" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { profile_id } = req.query;
    const updateData = req.body;

    if (!profile_id || typeof profile_id !== "string") {
      return res.status(400).json({ error: "Profile ID is required" });
    }

    if (!updateData || typeof updateData !== "object") {
      return res.status(400).json({ error: "Update data is required" });
    }

    // Get the current profile
    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, profile_id),
    });

    if (!existingProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Validate the fields that can be updated
    const validFields = [
      "full_name",
      "avatar_url",
      "address",
      "email",
      "username",
      "user_settings",
    ];

    // Filter out any fields that are not allowed to be updated
    const sanitizedData: Record<string, any> = {};
    Object.keys(updateData).forEach((key) => {
      if (validFields.includes(key)) {
        sanitizedData[key] = updateData[key];
      }
    });

    // Special handling for nested user_settings object
    if (updateData.user_settings && typeof updateData.user_settings === "object") {
      // Merge existing user_settings with the new ones rather than replacing
      sanitizedData.user_settings = {
        ...(existingProfile.user_settings || {}),
        ...updateData.user_settings,
      };
    }

    if (Object.keys(sanitizedData).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    // Update the profile
    const [updatedProfile] = await db
      .update(profiles)
      .set({
        ...sanitizedData,
      })
      .where(eq(profiles.id, profile_id))
      .returning();

    if (!updatedProfile) {
      return res.status(500).json({ error: "Failed to update profile" });
    }

    return res.status(200).json({ profile: updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error updating profile information",
    });
  }
}
