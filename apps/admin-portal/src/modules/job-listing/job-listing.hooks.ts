import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { bulkDeleteResource } from "@/lib/api";

import {
  fetchJobListings,
  createJobListing,
  updateJobListing,
  duplicateJobListing,
  fetchJobListingById,
} from "@/job-listing/job-listing.service";
import { JobListingCreateData, JobListingUpdateData } from "@/job-listing/job-listing.type";

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
    mutationFn: (data: JobListingCreateData) => createJobListing(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobListingKeys.lists() }),
    meta: { toast: { success: "JobListings.success.create", error: "JobListings.error.create" } },
  });
}

export function useDuplicateJobListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateJobListing(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobListingKeys.lists() }),
    meta: {
      toast: { success: "JobListings.success.duplicate", error: "JobListings.error.duplicate" },
    },
  });
}

export function useUpdateJobListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: JobListingUpdateData }) =>
      updateJobListing(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobListingKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: jobListingKeys.lists() });
    },
    meta: {
      toast: { success: "JobListings.success.update", error: "JobListings.error.update" },
    },
  });
}

// Hook to bulk delete job listings
export function useBulkDeleteJobListings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteResource("/api/resource/job-listings", ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobListingKeys.lists() }),
    meta: { toast: { success: "JobListings.success.delete", error: "JobListings.error.delete" } },
  });
}
