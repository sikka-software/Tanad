import { Job, JobCreateData } from "@/types/job.type";

export async function fetchJobs(): Promise<Job[]> {
  try {
    const response = await fetch("/api/jobs");
    if (!response.ok) {
      throw new Error("Failed to fetch jobs");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw new Error("Failed to fetch jobs");
  }
}

export async function fetchJobById(id: string): Promise<Job> {
  try {
    const response = await fetch(`/api/jobs/${id}`);
    if (!response.ok) {
      throw new Error(`Job with id ${id} not found`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching job ${id}:`, error);
    throw new Error(`Failed to fetch job with id ${id}`);
  }
}

export async function createJob(job: JobCreateData): Promise<Job> {
  try {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    });
    if (!response.ok) {
      throw new Error("Failed to create job");
    }
    return response.json();
  } catch (error) {
    console.error("Error creating job:", error);
    throw new Error("Failed to create job");
  }
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<Job> {
  try {
    const response = await fetch(`/api/jobs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`Failed to update job with id ${id}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error updating job ${id}:`, error);
    throw new Error(`Failed to update job with id ${id}`);
  }
}

export async function deleteJob(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/jobs/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete job with id ${id}`);
    }
  } catch (error) {
    console.error(`Error deleting job ${id}:`, error);
    throw new Error(`Failed to delete job with id ${id}`);
  }
}

export async function bulkDeleteJobs(ids: string[]): Promise<void> {
  try {
    const response = await fetch("/api/jobs/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
      throw new Error("Failed to delete jobs");
    }
  } catch (error) {
    console.error("Error deleting jobs:", error);
    throw new Error("Failed to delete jobs");
  }
}
