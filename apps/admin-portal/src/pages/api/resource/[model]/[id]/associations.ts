import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { model, id } = req.query;
  if (model !== "job_listings" || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid model or id" });
  }

  const supabase = createClient({ req, res, query: {}, resolvedUrl: "" });
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user_id = user.id;
  const { job_ids } = req.body;

  if (!Array.isArray(job_ids)) {
    return res.status(400).json({ message: "job_ids must be an array" });
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

    // 2. Verify the job_listing belongs to the user's enterprise
    const { count: listingCount, error: listingVerifyError } = await supabase
      .from("job_listings")
      .select("*", { count: "exact", head: true })
      .eq("id", id)
      .eq("enterprise_id", enterprise_id);

    if (listingVerifyError) throw listingVerifyError;
    if (listingCount === 0) {
      return res.status(404).json({ message: `Job listing with id ${id} not found or not accessible.` });
    }

    // 3. Delete all existing associations for this job listing
    const { error: deleteError } = await supabase
      .from("job_listing_jobs")
      .delete()
      .eq("job_listing_id", id);
    if (deleteError) throw deleteError;

    // 4. Insert new associations
    if (job_ids.length > 0) {
      const recordsToInsert = job_ids.map((job_id: string) => ({
        job_listing_id: id,
        job_id,
        user_id,
        enterprise_id,
      }));
      const { error: insertError } = await supabase.from("job_listing_jobs").insert(recordsToInsert);
      if (insertError) throw insertError;
    }

    // Fetch the enriched job listing with jobs and jobs_count
    const { data: jobListing, error: jobListingError } = await supabase
      .from("job_listings")
      .select("*")
      .eq("id", id)
      .single();
    if (jobListingError || !jobListing) {
      throw jobListingError || new Error("Failed to fetch updated job listing");
    }
    const { data: jobLinks, error: jobsError } = await supabase
      .from("job_listing_jobs")
      .select("job_id")
      .eq("job_listing_id", id);
    if (jobsError) throw jobsError;
    return res.status(200).json({
      ...jobListing,
      jobs: jobLinks?.map((j: any) => j.job_id) || [],
      jobs_count: jobLinks?.length || 0,
    });
  } catch (error: any) {
    console.error("Error in PUT /api/resource/job_listings/[id]/associations:", error);
    return res.status(500).json({ message: error.message || "Failed to update associations" });
  }
} 