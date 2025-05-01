import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchJobListings,
  bulkDeleteJobListings,
  createJobListing,
  updateJobListing,
  duplicateJobListing,
  fetchJobListingById,
} from "@/job-listing/job-listing.service";
import { JobListing } from "@/job-listing/job-listing.type";

export const jobListingKeys = {
  all: ["jobListings"] as const,
  lists: () => [...jobListingKeys.all, "list"] as const,
  list: (filters: any) => [...jobListingKeys.lists(), { filters }] as const,
  details: () => [...jobListingKeys.all, "detail"] as const,
  detail: (id: string) => [...jobListingKeys.details(), id] as const,
};

export function useJobListings() {
  return useQuery({
    queryKey: jobListingKeys.lists(),
    queryFn: fetchJobListings,
  });
}

// Hook to fetch a single job listing
export function useJobListing(id: string) {
  return useQuery({
    queryKey: jobListingKeys.detail(id),
    queryFn: () => fetchJobListingById(id),
    enabled: !!id,
  });
}

export function useCreateJobListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JobListing) => createJobListing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobListingKeys.lists() });
    },
  });
}

export function useDuplicateJobListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateJobListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobListingKeys.lists() });
    },
  });
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
