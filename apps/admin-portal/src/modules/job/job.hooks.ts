import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import { fetchJobs, fetchJobById, createJob, updateJob, duplicateJob } from "@/job/job.service";
import { JobCreateData, JobUpdateData } from "@/job/job.type";

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
    mutationFn: (job: JobCreateData) => createJob(job),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobKeys.lists() }),
    meta: {
      operation: "create",
      toast: { success: "Jobs.success.create", error: "Jobs.error.create" },
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: JobUpdateData }) => updateJob(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
    meta: {
      operation: "update",
      toast: { success: "Jobs.success.update", error: "Jobs.error.update" },
    },
  });
}

// Hook to duplicate a job
export function useDuplicateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateJob(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
    meta: {
      operation: "duplicate",
      toast: { success: "Jobs.success.duplicate", error: "Jobs.error.duplicate" },
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResourceById(`/api/resource/jobs/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.removeQueries({ queryKey: jobKeys.detail(variables) });
    },
    meta: {
      operation: "delete",
      toast: { success: "Jobs.success.delete", error: "Jobs.error.delete" },
    },
  });
}

export function useBulkDeleteJobs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteResource("/api/resource/jobs", ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobKeys.lists() }),
    meta: {
      operation: "delete",
      toast: { success: "Jobs.success.delete", error: "Jobs.error.delete" },
    },
  });
}
