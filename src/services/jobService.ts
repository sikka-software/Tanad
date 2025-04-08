import { supabase } from "@/lib/supabase";
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
  try {
    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error("You must be logged in to create a job");
    }

    // Add the userId to the job data if not already present
    const jobWithUserId = {
      ...jobData,
      userId: jobData.userId || userData.user.id
    };

    const response = await fetch("/api/jobs/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobWithUserId),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.details || "Failed to create job");
    }

    return response.json();
  } catch (error) {
    console.error("Error in createJob service:", error);
    throw error;
  }
} 