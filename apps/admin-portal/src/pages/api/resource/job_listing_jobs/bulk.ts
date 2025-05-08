import { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const supabase = createClient({ req, res, query: {}, resolvedUrl: "" });
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    console.error("API Auth Error:", authError);
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user_id = user.id;
  const { job_listing_id, job_ids } = req.body;

  if (!job_listing_id || !Array.isArray(job_ids) || job_ids.length === 0) {
    return res.status(400).json({
      message: "Invalid request body: 'job_listing_id' and 'job_ids' array are required.",
    });
  }

  try {
    // 1. Fetch enterprise_id for the user
    const { data: membership, error: enterpriseError } = await supabase
      .from("memberships")
      .select("enterprise_id")
      .eq("profile_id", user_id)
      .maybeSingle();

    if (enterpriseError) throw enterpriseError;
    if (!membership?.enterprise_id) {
      return res.status(403).json({ message: "User is not associated with an enterprise." });
    }
    const enterprise_id = membership.enterprise_id;

    // 2. Verify the job_listing belongs to the user's enterprise (optional but recommended)
    const { count: listingCount, error: listingVerifyError } = await supabase
      .from("job_listings")
      .select("*", { count: "exact", head: true })
      .eq("id", job_listing_id)
      .eq("enterprise_id", enterprise_id);

    if (listingVerifyError) throw listingVerifyError;
    if (listingCount === 0) {
      return res.status(404).json({
        message: `Job listing with id ${job_listing_id} not found or not accessible.`,
      });
    }

    // 3. Prepare data for insertion
    const recordsToInsert = job_ids.map((job_id) => ({
      job_listing_id: job_listing_id,
      job_id: job_id,
      user_id: user_id, // Track who made the association
      enterprise_id: enterprise_id, // Ensure association stays within enterprise
    }));

    // 4. Insert the associations
    const { error: insertError } = await supabase.from("job_listing_jobs").insert(recordsToInsert);

    if (insertError) throw insertError;

    return res.status(201).json({ message: "Associations created successfully" });
  } catch (error: any) {
    console.error("Error in POST /api/resource/job_listing_jobs/bulk:", error);
    return res.status(500).json({ message: error.message || "Failed to create associations" });
  }
}
