import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchJobListings, bulkDeleteJobListings } from "@/services/jobListingService";

import { JobListing } from "@/types/job-listing.type";

export function useJobListings() {
  return useQuery<JobListing[]>({
    queryKey: ["jobListings"],
    queryFn: fetchJobListings,
  });
}

export function useBulkDeleteJobListings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteJobListings(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobListings"] });
    },
  });
}
