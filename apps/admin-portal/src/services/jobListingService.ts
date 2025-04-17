import { JobListing } from "@/types/job-listing.type";
import useUserStore from "@/hooks/use-user-store";

export async function fetchJobListings(): Promise<JobListing[]> {
  try {
    const user = useUserStore.getState().user;
    if (!user?.id) {
      throw new Error("User ID is required");
    }

    const response = await fetch("/api/jobs/listings", {
      headers: {
        "x-user-id": user.id,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch job listings");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching job listings:", error);
    throw error;
  }
}

export async function bulkDeleteJobListings(ids: string[]): Promise<void> {
  try {
    const user = useUserStore.getState().user;
    if (!user?.id) {
      throw new Error("User ID is required");
    }

    const response = await fetch("/api/jobs/listings/bulk-delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user.id,
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete job listings");
    }
  } catch (error) {
    console.error("Error deleting job listings:", error);
    throw error;
  }
}
