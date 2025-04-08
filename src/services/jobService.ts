import { Job } from "@/types/job.type";

export async function fetchJobs(): Promise<Job[]> {
  const response = await fetch("/api/jobs");
  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }
  const data = await response.json();
  return data.jobs;
}

export async function createJob(jobData: Omit<Job, "id" | "createdAt" | "updatedAt">): Promise<Job> {
  const response = await fetch("/api/jobs/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jobData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create job");
  }

  return response.json();
} 