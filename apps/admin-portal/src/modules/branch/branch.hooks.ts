import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import {
  createBranch,
  fetchBranchById,
  fetchBranches,
  updateBranch,
  duplicateBranch,
} from "@/branch/branch.service";
import type { Branch, BranchCreateData, BranchUpdateData } from "@/branch/branch.type";

// Query keys for branches
export const branchKeys = {
  all: ["branches"] as const,
  lists: () => [...branchKeys.all, "list"] as const,
  list: (filters: any) => [...branchKeys.lists(), { filters }] as const,
  details: () => [...branchKeys.all, "detail"] as const,
  detail: (id: string) => [...branchKeys.details(), id] as const,
};

// Hook to fetch all branches
export function useBranches() {
  return useQuery({
    queryKey: branchKeys.lists(),
    queryFn: fetchBranches,
  });
}

// Hook to fetch a single branch by ID
export function useBranch(id: string) {
  return useQuery({
    queryKey: branchKeys.detail(id),
    queryFn: () => fetchBranchById(id),
    enabled: !!id, // Only run query if id is truthy
  });
}

// Hook for creating a new branch
export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newBranch: BranchCreateData) => createBranch(newBranch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: branchKeys.lists() }),
    meta: {
      operation: "create",
      toast: { success: "Branches.success.create", error: "Branches.error.create" },
    },
  });
}

// Hook for updating an existing branch
export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BranchUpdateData }) => updateBranch(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: branchKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: branchKeys.lists() });

      // Snapshot the previous value
      const previousBranch = queryClient.getQueryData<Branch>(branchKeys.detail(id));
      const previousBranches = queryClient.getQueryData<Branch[]>(branchKeys.lists());

      // Optimistically update to the new value
      // Update detail cache
      if (previousBranch) {
        queryClient.setQueryData<Branch>(branchKeys.detail(id), {
          ...previousBranch,
          ...data,
          // Ensure created_at is preserved if not part of the update
          created_at: previousBranch.created_at,
        });
      }

      // Update list cache
      if (previousBranches) {
        queryClient.setQueryData<Branch[]>(
          branchKeys.lists(),
          previousBranches.map((branch) =>
            branch.id === id
              ? { ...branch, ...data, created_at: branch.created_at } // Preserve created_at here too
              : branch,
          ),
        );
      }

      // Return a context object with the snapshotted value
      return { previousBranch, previousBranches };
    },
    onError: (err, { id }, context) => {
      console.error("Update failed:", err);
      if (context?.previousBranch) {
        queryClient.setQueryData(branchKeys.detail(id), context.previousBranch);
      }
      if (context?.previousBranches) {
        queryClient.setQueryData(branchKeys.lists(), context.previousBranches);
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
    meta: {
      operation: "update",
      toast: { success: "Branches.success.update", error: "Branches.error.update" },
    },
  });
}

// Hook for duplicating a branch
export function useDuplicateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateBranch(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
    meta: {
      operation: "duplicate",
      toast: { success: "Branches.success.duplicate", error: "Branches.error.duplicate" },
    },
  });
}

// Hook for deleting a branch
export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteResourceById(`/api/resource/branches/${id}`),
    onSuccess: (_, variables) => {
      // Invalidate the list and remove the specific detail query from cache
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      queryClient.removeQueries({ queryKey: branchKeys.detail(variables) });
    },
    meta: {
      operation: "delete",
      toast: { success: "Branches.success.delete", error: "Branches.error.delete" },
    },
  });
}

// Hook for bulk deleting branches
export function useBulkDeleteBranches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteResource("/api/resource/branches", ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: branchKeys.lists() }),
    meta: {
      operation: "delete",
      toast: { success: "Branches.success.delete", error: "Branches.error.delete" },
    },
  });
}
