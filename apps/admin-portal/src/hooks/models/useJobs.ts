import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchJobs,
  fetchJobById,
  createJob,
  updateJob,
  deleteJob,
  bulkDeleteJobs,
} from "@/services/jobService";

import { Job } from "@/types/job.type";

export const jobKeys = {
  all: ["jobs"] as const,
  lists: () => [...jobKeys.all, "list"] as const,
  list: (filters: any) => [...jobKeys.lists(), { filters }] as const,
  details: () => [...jobKeys.all, "detail"] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
};

export function useJobs() {
  return useQuery({
    queryKey: jobKeys.lists(),
    queryFn: fetchJobs,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => fetchJobById(id),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (job: Job) => createJob(job),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Job> }) => updateJob(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteJob,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.removeQueries({ queryKey: jobKeys.detail(variables) });
    },
  });
}

export function useBulkDeleteJobs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteJobs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}
