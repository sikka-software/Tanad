import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchJobListings,
  bulkDeleteJobListings,
  createJobListing,
  updateJobListing,
} from "@/modules/job-listing/job-listing.service";
import { JobListing } from "@/modules/job-listing/job-listing.type";

export const jobListingKeys = {
  all: ["jobListings"] as const,
  lists: () => [...jobListingKeys.all, "list"] as const,
  list: (filters: any) => [...jobListingKeys.lists(), { filters }] as const,
  details: () => [...jobListingKeys.all, "detail"] as const,
  detail: (id: string) => [...jobListingKeys.details(), id] as const,
};

export function useJobListings() {
  const queryClient = useQueryClient();

  const query = useQuery<JobListing[]>({
    queryKey: jobListingKeys.lists(),
    queryFn: fetchJobListings,
  });

  const createMutation = useMutation({
    mutationFn: (
      data: Pick<JobListing, "title" | "user_id"> & {
        description?: string | undefined;
        jobs?: string[];
      },
    ) => createJobListing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobListingKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: jobListingKeys.lists() });
    },
  });
}

export function useUpdateJobListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      jobListing,
    }: {
      id: string;
      jobListing: Partial<Omit<JobListing, "id" | "created_at">>;
    }) => updateJobListing(id, jobListing),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobListingKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: jobListingKeys.lists() });
    },
  });
}
