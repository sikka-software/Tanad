import { useQuery } from "@tanstack/react-query";

import { Job } from "@/api/jobs";

async function fetchJobs(): Promise<Job[]> {
  const response = await fetch("/api/jobs");
  if (!response.ok) {
    throw new Error("failed_to_fetch_jobs");
  }
  const data = await response.json();
  return data.jobs;
}

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });
} 