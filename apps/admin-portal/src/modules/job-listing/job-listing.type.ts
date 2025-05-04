import { Database } from "@/lib/database.types";

import { Job } from "@/job/job.type";

export type JobListing = Database["public"]["Tables"]["job_listings"]["Row"] & {
  jobs?: (JobListingJob | string)[]; // Optional array of related jobs
};

export type JobListingJob = Database["public"]["Tables"]["job_listing_jobs"]["Row"];

export type JobListingCreateData = Omit<JobListing, "id" | "created_at"> & {
  user_id: string;
};

export type JobListingUpdateData = Partial<JobListing>;
