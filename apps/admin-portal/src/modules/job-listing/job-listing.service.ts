import { JobListing } from "@/modules/job-listing/job-listing.type";
import useUserStore from "@/stores/use-user-store";

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

export async function createJobListing(
  data: Pick<JobListing, "title" | "user_id"> & {
    description?: string | undefined;
    jobs?: string[];
  },
): Promise<JobListing> {
  try {
    const user = useUserStore.getState().user;
    if (!user?.id) {
      throw new Error("User ID is required");
    }

    const response = await fetch("/api/jobs/listings/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user.id,
      },
      body: JSON.stringify({
        ...data,
        description: data.description ?? null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create job listing");
    }
    return response.json();
  } catch (error) {
    console.error("Error creating job listing:", error);
    throw error;
  }
}

export async function updateJobListing(id: string, jobListing: Partial<JobListing>) {
  try {
    const response = await fetch(`/api/jobs/listings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobListing),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update job listing with id ${id}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error updating job listing:", error);
    throw error;
  }
}
