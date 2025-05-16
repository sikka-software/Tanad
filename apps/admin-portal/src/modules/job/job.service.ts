import { Job, JobCreateData, JobUpdateData } from "@/job/job.type";

export async function fetchJobs(): Promise<Job[]> {
  try {
    const response = await fetch("/api/resource/jobs");
    if (!response.ok) {
      console.error("Failed to fetch jobs:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}

export async function fetchJobById(id: string): Promise<Job> {
  try {
    const response = await fetch(`/api/resource/jobs/${id}`);
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
    const response = await fetch("/api/resource/jobs", {
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

export async function updateJob(id: string, updates: JobUpdateData): Promise<Job> {
  try {
    const response = await fetch(`/api/resource/jobs/${id}`, {
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
export async function duplicateJob(id: string): Promise<Job> {
  const response = await fetch(`/api/resource/jobs/${id}/duplicate`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to duplicate job with id ${id}`);
  }
  return response.json();
}
