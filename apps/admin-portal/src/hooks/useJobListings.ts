import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import useUserStore from "@/hooks/use-user-store";
import { JobListing, JobListingFormValues } from "@/types/job-listing.type";

const API_URL = "/api/jobs/listings";

export function useJobListings() {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  const { data: jobListings, isLoading } = useQuery({
    queryKey: ["job_listings"],
    queryFn: async () => {
      const response = await fetch(API_URL, {
        headers: {
          "x-user-id": user?.id || "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch job listings");
      }
      return response.json();
    },
    enabled: !!user?.id,
  });

  const createJobListing = useMutation({
    mutationFn: async (newListing: JobListingFormValues) => {
      if (!user?.id) {
        throw new Error("User ID is required");
      }

      const response = await fetch(`${API_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify(newListing),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || "Failed to create job listing");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_listings"] });
    },
  });

  return {
    jobListings,
    isLoading,
    createJobListing,
  };
}
