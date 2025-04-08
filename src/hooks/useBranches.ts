import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Branch, BranchCreateData } from '@/types/branch.type';
import {
  createBranch,
  deleteBranch,
  fetchBranchById,
  fetchBranches,
  updateBranch,
} from '@/services/branchService';

// Query keys for branches
export const branchKeys = {
  all: ['branches'] as const,
  lists: () => [...branchKeys.all, 'list'] as const,
  list: (filters: any) => [...branchKeys.lists(), { filters }] as const,
  details: () => [...branchKeys.all, 'detail'] as const,
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
    mutationFn: (newBranch: Omit<Branch, 'id' | 'created_at'> & { user_id: string }) => {
      // Map user_id to userId for the service function
      const { user_id, ...rest } = newBranch;
      const branchData: BranchCreateData = {
        ...rest,
        userId: user_id,
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
    mutationFn: ({ id, branch }: { id: string; branch: Partial<Omit<Branch, 'id' | 'created_at'>> }) =>
      updateBranch(id, branch),
    onSuccess: (data) => {
      // Invalidate both the specific detail and the list queries
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