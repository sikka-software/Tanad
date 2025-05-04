import { JobListing, JobListingCreateData } from "./job-listing.type";

export async function fetchJobListings(): Promise<JobListing[]> {
  try {
    const response = await fetch("/api/resource/job_listings");
    if (!response.ok) {
      console.error("Failed to fetch job listings:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching job listings:", error);
    return [];
  }
}

export async function fetchJobListingById(id: string): Promise<JobListing> {
  try {
    const response = await fetch(`/api/resource/job_listings/${id}`);
    if (!response.ok) {
      throw new Error(`Job listing with id ${id} not found`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching job listing ${id}:`, error);
    throw new Error(`Failed to fetch job listing with id ${id}`);
  }
}

export async function createJobListing(jobListing: JobListingCreateData): Promise<JobListing> {
  try {
    const response = await fetch("/api/resource/job_listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobListing),
    });
    if (!response.ok) {
      throw new Error("Failed to create job listing");
    }
    return response.json();
  } catch (error) {
    console.error("Error creating job listing:", error);
    throw new Error("Failed to create job listing");
  }
}

export async function updateJobListing(
  id: string,
  updates: Partial<JobListing>,
): Promise<JobListing> {
  try {
    const response = await fetch(`/api/resource/job_listings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`Failed to update job listing with id ${id}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error updating job listing ${id}:`, error);
    throw new Error(`Failed to update job listing with id ${id}`);
  }
}
export async function duplicateJobListing(id: string): Promise<JobListing> {
  const response = await fetch(`/api/resource/job_listings/${id}/duplicate`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to duplicate job listing with id ${id}`);
  }
  return response.json();
}

export async function deleteJobListing(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/resource/job_listings/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete job listing with id ${id}`);
    }
  } catch (error) {
    console.error(`Error deleting job listing ${id}:`, error);
    throw new Error(`Failed to delete job listing with id ${id}`);
  }
}

export async function bulkDeleteJobListings(ids: string[]): Promise<void> {
  try {
    const response = await fetch("/api/resource/job_listings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
      throw new Error("Failed to delete job listings");
    }
  } catch (error) {
    console.error("Error deleting job listings:", error);
    throw new Error("Failed to delete job listings");
  }
}

export async function bulkAssociateJobsWithListing(
  listingId: string,
  jobIds: string[],
): Promise<void> {
  try {
    // Assuming an endpoint exists to handle bulk association
    const response = await fetch("/api/resource/job_listing_jobs/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_listing_id: listingId, job_ids: jobIds }),
    });
    if (!response.ok) {
      throw new Error("Failed to associate jobs with listing");
    }
  } catch (error) {
    console.error(`Error associating jobs with listing ${listingId}:`, error);
    throw new Error(`Failed to associate jobs with listing ${listingId}`);
  }
}

export async function updateListingJobAssociations(
  listingId: string,
  jobIds: string[],
): Promise<void> {
  try {
    // Assuming an endpoint handles clearing and re-associating
    // Alternatively, call a delete endpoint first, then the bulk associate endpoint
    const response = await fetch(`/api/resource/job_listings/${listingId}/associations`, {
      method: "PUT", // Or POST, depending on API design
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_ids: jobIds }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update job associations for listing ${listingId}`);
    }
  } catch (error) {
    console.error(`Error updating job associations for listing ${listingId}:`, error);
    throw new Error(`Failed to update job associations for listing ${listingId}`);
  }
}
