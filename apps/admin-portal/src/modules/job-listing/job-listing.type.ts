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
  jobs?: (Job | string)[]; // Optional array of related jobs
}

export interface JobListingJob {
  id: string;
  job_listing_id: string;
  job_id: string;
  created_at: string;
  job?: Job; // Optional related job
}

export interface JobListingFormValues {
  title: string;
  description?: string;
  jobs?: string[];
  user_id?: string;
}

export type JobListingUpdateData = Partial<JobListing>;
