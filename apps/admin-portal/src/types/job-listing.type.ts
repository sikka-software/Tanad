import { Job } from "./job.type";

export interface JobListing {
  id: string;
  title: string;
  description?: string;
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