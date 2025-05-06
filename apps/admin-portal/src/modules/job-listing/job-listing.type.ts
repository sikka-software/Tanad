import { Database } from "@/lib/database.types";

export type JobListing = Database["public"]["Tables"]["job_listings"]["Row"];
export type JobListingCreateData = Database["public"]["Tables"]["job_listings"]["Insert"];
export type JobListingUpdateData = Database["public"]["Tables"]["job_listings"]["Update"];
