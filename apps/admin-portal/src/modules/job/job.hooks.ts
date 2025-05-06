import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  fetchJobs,
  fetchJobById,
  createJob,
  updateJob,
  deleteJob,
  bulkDeleteJobs,
  duplicateJob,
} from "@/job/job.service";
import { Job, JobCreateData, JobUpdateData } from "@/job/job.type";

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
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (job: JobCreateData) => createJob(job),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      toast.success(t("General.successful_operation"), {
        description: t("Jobs.success.create"),
      });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  const t = useTranslations();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: JobUpdateData }) => updateJob(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      toast.success(t("General.successful_operation"), {
        description: t("Jobs.success.update"),
      });
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
