import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchJobListings,
  bulkDeleteJobListings,
  createJobListing,
} from "@/services/jobListingService";

import { JobListing } from "@/types/job-listing.type";

export function useJobListings() {
  const queryClient = useQueryClient();

  const query = useQuery<JobListing[]>({
    queryKey: ["jobListings"],
    queryFn: fetchJobListings,
  });

  const createMutation = useMutation({
    mutationFn: (data: Pick<JobListing, 'title' | 'user_id'> & { description?: string | undefined; jobs?: string[] }) => createJobListing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobListings"] });
    },
  });

  return {
    ...query,
    createJobListing: createMutation,
  };
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
