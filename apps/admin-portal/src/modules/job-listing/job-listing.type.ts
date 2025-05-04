import { Database } from "@/lib/database.types";

import { Job } from "@/job/job.type";

export interface JobListing {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  enterprise_id: string;
  is_public: boolean;
  jobs?: Job[]; // Optional array of associated jobs (e.g., for preview page)
  job_count?: number; // Optional count of associated jobs (e.g., for list view)
}

export type JobListingJob = Database["public"]["Tables"]["job_listing_jobs"]["Row"];

export type JobListingCreateData = Omit<JobListing, "id" | "created_at"> & {
  user_id: string;
};

export type JobListingUpdateData = Partial<JobListing>;
