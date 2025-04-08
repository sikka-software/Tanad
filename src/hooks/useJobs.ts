import { useQuery } from "@tanstack/react-query";

import { Job } from "@/types/job.type";
import { fetchJobs } from "@/services/jobService";

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });
} 