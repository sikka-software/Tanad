import useUserStore from "@/hooks/use-user-store";
import { Job } from "@/types/job.type";

export async function fetchJobs(): Promise<Job[]> {
  const response = await fetch("/api/jobs");
  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }
  const data = await response.json();
  return data.jobs;
}

export async function createJob(
  jobData: Omit<Job, "id" | "createdAt" | "updatedAt" | "user_id">,
  user_id?: string,
): Promise<Job> {
  try {
    // First try to use provided user_id
    let finaluser_id = user_id;

    // If not provided, get user from Zustand store
    if (!finaluser_id) {
      const userStore = useUserStore.getState();
      const user = userStore.user;

      if (user && user.id) {
        finaluser_id = user.id;
      }
    }

    if (!finaluser_id) {
      console.error("No user ID available");
      throw new Error("You must be logged in to create a job");
    }

    // Add user ID to job data (IMPORTANT: use user_id to match the RLS policy)
    const jobWithuser_id = {
      ...jobData,
      user_id: finaluser_id, // Keep camelCase for TypeScript
      user_id: finaluser_id, // Add snake_case for RLS policy
    };

    console.log("Creating job with payload:", JSON.stringify(jobWithuser_id, null, 2));

    const response = await fetch("/api/jobs/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobWithuser_id),
    });

    const result = await response.json();
    console.log("Response from server:", result);

    if (!response.ok) {
      console.error("Server response error:", result);
      throw new Error(result.error || result.details || "Failed to create job");
    }

    return result;
  } catch (error) {
    console.error("Error in createJob service:", error);
    throw error;
  }
}
