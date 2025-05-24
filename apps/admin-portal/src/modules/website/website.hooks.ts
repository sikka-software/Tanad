import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import {
  createWebsite,
  fetchWebsiteById,
  fetchWebsites,
  updateWebsite,
  duplicateWebsite,
} from "./website.service";
import type { Website, WebsiteCreateData, WebsiteUpdateData } from "./website.type";

// Query keys for websites
export const websiteKeys = {
  all: ["websites"] as const,
  lists: () => [...websiteKeys.all, "list"] as const,
  list: (filters: any) => [...websiteKeys.lists(), { filters }] as const,
  details: () => [...websiteKeys.all, "detail"] as const,
  detail: (id: string) => [...websiteKeys.details(), id] as const,
};

// Hook to fetch all websites
export function useWebsites() {
  return useQuery({
    queryKey: websiteKeys.lists(),
    queryFn: fetchWebsites,
  });
}

// Hook to fetch a single website by ID
export function useWebsite(id: string) {
  return useQuery({
    queryKey: websiteKeys.detail(id),
    queryFn: () => fetchWebsiteById(id),
    enabled: !!id, // Only run query if id is truthy
  });
}

// Hook for creating a new website
export function useCreateWebsite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newWebsite: WebsiteCreateData & { user_id: string }) => {
      // Map user_id to user_id for the service function
      const { user_id, ...rest } = newWebsite;
      const websiteData: WebsiteCreateData = {
        ...rest,
        user_id: user_id,
      };
      return createWebsite(websiteData);
    },
    onSuccess: () => {
      // Invalidate the list query to refetch
      queryClient.invalidateQueries({ queryKey: websiteKeys.lists() });
    },
    meta: {
      operation: "create",
      toast: { success: "Websites.success.create", error: "Websites.error.create" },
    },
  });
}

// Hook for updating an existing website
export function useUpdateWebsite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WebsiteUpdateData }) => updateWebsite(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: websiteKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: websiteKeys.lists() });

      // Snapshot the previous value
      const previousWebsite = queryClient.getQueryData<Website>(websiteKeys.detail(id));
      const previousWebsites = queryClient.getQueryData<Website[]>(websiteKeys.lists());

      // Optimistically update to the new value
      // Update detail cache
      if (previousWebsite) {
        queryClient.setQueryData<Website>(websiteKeys.detail(id), {
          ...previousWebsite,
          ...data,
          // Ensure created_at is preserved if not part of the update
          created_at: previousWebsite.created_at,
        });
      }

      // Update list cache
      if (previousWebsites) {
        queryClient.setQueryData<Website[]>(
          websiteKeys.lists(),
          previousWebsites.map((website) =>
            website.id === id
              ? { ...website, ...data, created_at: website.created_at } // Preserve created_at here too
              : website,
          ),
        );
      }

      // Return a context object with the snapshotted value
      return { previousWebsite, previousWebsites };
    },
    onError: (err, { id }, context) => {
      console.error("Update failed:", err);
      if (context?.previousWebsite) {
        queryClient.setQueryData(websiteKeys.detail(id), context.previousWebsite);
      }
      if (context?.previousWebsites) {
        queryClient.setQueryData(websiteKeys.lists(), context.previousWebsites);
      }
    },
    onSettled: (data, error, { id }) => {
      // Invalidate queries to ensure eventual consistency
      queryClient.invalidateQueries({ queryKey: websiteKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: websiteKeys.lists() });

      // Show success toast only if the mutation succeeded
    },
    meta: {
      operation: "update",
      toast: { success: "Websites.success.update", error: "Websites.error.update" },
    },
  });
}

// Hook for duplicating a website
export function useDuplicateWebsite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateWebsite(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: websiteKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: websiteKeys.lists() });
    },
    meta: {
      operation: "duplicate",
      toast: { success: "Websites.success.duplicate", error: "Websites.error.duplicate" },
    },
  });
}

// Hook for deleting a website
export function useDeleteWebsite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteResourceById(`/api/resource/websites/${id}`),
    onSuccess: (_, variables) => {
      // Invalidate the list and remove the specific detail query from cache
      queryClient.invalidateQueries({ queryKey: websiteKeys.lists() });
      queryClient.removeQueries({ queryKey: websiteKeys.detail(variables) });
    },
    meta: {
      operation: "delete",
      toast: { success: "Websites.success.delete", error: "Websites.error.delete" },
    },
  });
}

// Hook for bulk deleting websites
export function useBulkDeleteWebsites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteResource("/api/resource/websites", ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: websiteKeys.lists() }),
    meta: {
      operation: "delete",
      toast: { success: "Websites.success.delete", error: "Websites.error.delete" },
    },
  });
}
