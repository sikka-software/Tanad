import { JobListing } from "@/job-listing/job-listing.type";

import useUserStore from "@/stores/use-user-store";

import { Company } from "../company/company.type";

export async function fetchJobListings(): Promise<JobListing[]> {
  try {
    const user = useUserStore.getState().user;
    if (!user?.id) {
      throw new Error("User ID is required");
    }

    const response = await fetch("/api/resources/job-listings", {
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

    const response = await fetch("/api/resources/job-listings/bulk-delete", {
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

export async function createJobListing(data: JobListing): Promise<JobListing> {
  try {
    const user = useUserStore.getState().user;
    if (!user?.id) {
      throw new Error("User ID is required");
    }

    const response = await fetch("/api/resources/job-listings/create", {
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

export async function fetchJobListingById(id: string): Promise<JobListing> {
  const response = await fetch(`/api/resource/job-listings/${id}`);
  if (!response.ok) {
    throw new Error(`Job listing with id ${id} not found`);
  }
  return response.json();
}

export async function duplicateJobListing(id: string): Promise<JobListing> {
  try {
    const response = await fetch(`/api/resources/job-listings/${id}/duplicate`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to duplicate job listing");
    }
    return response.json();
  } catch (error) {
    console.error("Error duplicating job listing:", error);
    throw error;
  }
}

export async function updateJobListing(id: string, jobListing: Partial<JobListing>) {
  try {
    const response = await fetch(`/api/resources/job-listings/${id}`, {
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
