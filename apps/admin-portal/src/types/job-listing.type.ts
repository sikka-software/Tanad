import { Job } from "./job.type";

export interface JobListing {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  jobs?: Job[]; // Optional array of related jobs
}

export interface JobListingJob {
  id: string;
  jobListingId: string;
  jobId: string;
  createdAt: string;
  job?: Job; // Optional related job
}

export interface JobListingFormValues {
  title: string;
  description?: string;
  jobs?: string[];
  userId?: string;
} 