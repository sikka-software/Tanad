import { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/server-props";

type SettingsUpdateResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SettingsUpdateResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const supabase = createClient({
    req,
    res,
    query: {},
    resolvedUrl: "",
  });

  try {
    // First try to get the session from Supabase directly

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get the user_id from either the session or the request body as fallback

    if (!user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized - No user ID found" });
    }

    // Remove user_id from body if it exists, keeping only the settings data
    const { user_id: _, ...settingsData } = req.body;

    // Update the profile with the new settings
    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: settingsData.full_name || undefined,
        email: settingsData.email || undefined,
        user_settings: {
          // Preserve existing settings and update with new values
          ...(settingsData.user_settings || {}),
          timezone: settingsData.timezone || undefined,
          // Include any other fields from the request
          ...(settingsData.language ? { language: settingsData.language } : {}),
        },
      })
      .eq("id", user?.id)
      .select();

    // If email was updated, also update it in auth
    if (settingsData.email) {
      try {
        const { error: updateAuthError } = await supabase.auth.updateUser({
          email: settingsData.email,
        });

        if (updateAuthError) {
          console.warn("Warning: Email updated in profile but not in auth:", updateAuthError);
        }
      } catch (authError) {
        console.warn("Warning: Error updating email in auth:", authError);
      }
    }

    if (error) {
      console.error("Error updating settings in database:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update settings in database",
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
}
