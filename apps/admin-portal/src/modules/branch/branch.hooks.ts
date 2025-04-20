import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBranch,
  deleteBranch,
  fetchBranchById,
  fetchBranches,
  updateBranch,
  bulkDeleteBranches,
  duplicateBranch,
} from "@/modules/branch/branch.service";
import type { Branch, BranchCreateData } from "@/modules/branch/branch.type";

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
    mutationFn: (newBranch: Omit<Branch, "id" | "created_at"> & { user_id: string }) => {
      // Map user_id to user_id for the service function
      const { user_id, ...rest } = newBranch;
      const branchData: BranchCreateData = {
        ...rest,
        user_id: user_id,
      };
      return createBranch(branchData);
    },
    onSuccess: () => {
      // Invalidate the list query to refetch
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });
}

// Hook for updating an existing branch
export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Branch> }) => updateBranch(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
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
  });
}

// Hook for deleting a branch
export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBranch(id),
    onSuccess: (_, variables) => {
      // Invalidate the list and remove the specific detail query from cache
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      queryClient.removeQueries({ queryKey: branchKeys.detail(variables) });
    },
  });
}

// Hook for bulk deleting branches
export function useBulkDeleteBranches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteBranches,
    onSuccess: () => {
      // Invalidate the list query
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });
}
