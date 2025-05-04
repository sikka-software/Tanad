import { createGenericStore } from "@/utils/generic-store";

import { JobListing } from "./job-listing.type";

const searchJobListingFn = (jobListing: JobListing, searchQuery: string) =>
  jobListing.title.toLowerCase().includes(searchQuery.toLowerCase());

const useJobListingStore = createGenericStore<JobListing>("job_listings", searchJobListingFn);

export default useJobListingStore;
