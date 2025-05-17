import { Database } from "@/lib/database.types";

import { Job } from "@/job/job.type";

import { Department } from "../department/department.type";

export type JobListing = Database["public"]["Tables"]["job_listings"]["Row"];
export type JobListingCreateData = Database["public"]["Tables"]["job_listings"]["Insert"] & {
  // locations?: Location[];
  // departments?: Department[];
  jobs?: Job[];
};

export type JobListingUpdateData = Database["public"]["Tables"]["job_listings"]["Update"] & {
  // departments?: Department[];
  // locations?: any[];
  jobs?: Job[];
};

export type JobListingWithJobs = JobListing & {
  jobs: Job[];
  jobs_count?: number;
};
