import { Database } from "@/lib/database.types";

import { Job } from "@/job/job.type";

export type JobListing = Database["public"]["Tables"]["job_listings"]["Row"];
export type JobListingCreateData = Database["public"]["Tables"]["job_listings"]["Insert"];
export type JobListingUpdateData = Database["public"]["Tables"]["job_listings"]["Update"];

export type JobListingWithJobs = Database["public"]["Tables"]["job_listing_jobs"]["Row"];
