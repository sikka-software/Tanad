import { Job } from "./job.type";

export interface JobListing {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
  user_id: string;
  jobs?: Job[]; // Optional array of related jobs
}

export interface JobListingJob {
  id: string;
  job_listing_id: string;
  job_id: string;
  createdAt: string;
  job?: Job; // Optional related job
}

export interface JobListingFormValues {
  title: string;
  description?: string;
  jobs?: string[];
  user_id?: string;
} 