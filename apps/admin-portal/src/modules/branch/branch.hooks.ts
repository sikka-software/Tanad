import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

import {
  createBranch,
  deleteBranch,
  fetchBranchById,
  fetchBranches,
  updateBranch,
  bulkDeleteBranches,
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
  const t = useTranslations();

  return useMutation({
    mutationFn: (newBranch: BranchCreateData & { user_id: string }) => {
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
      toast.success(t("General.successful_operation"), {
        description: t("Branches.success.create"),
      });
    },
  });
}

// Hook for updating an existing branch
export function useUpdateBranch() {
  const queryClient = useQueryClient();
  const t = useTranslations();

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
      toast.error(t("General.error_operation"), {
        description: t("Branches.error.update"),
      });
    },
    onSettled: (data, error, { id }) => {
      // Invalidate queries to ensure eventual consistency
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });

      // Show success toast only if the mutation succeeded
      if (!error && data) {
        toast.success(t("General.successful_operation"), {
          description: t("Branches.success.update"),
        });
      }
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

// Define the type for the operations array from DataSheetGrid
// Using 'any' for now, can be refined if specific operation types are known/needed
type DataSheetOperation = any;

export function useBranchDatasheet(initialData: Branch[] = []) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [datasheetData, setDatasheetData] = useState<Branch[]>(initialData);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BranchUpdateData }) => updateBranch(id, data),
    onSuccess: (updatedBranch) => {
      // Option 1: Manually update the specific branch in the main query cache
      // queryClient.setQueryData(['branches'], (oldData: Branch[] | undefined) =>
      //   oldData ? oldData.map(b => b.id === updatedBranch.id ? updatedBranch : b) : []
      // );

      // Option 2: Manually update the specific branch detail query cache
      queryClient.setQueryData(branchKeys.detail(updatedBranch.id), updatedBranch);

      // Avoid invalidating the whole list immediately to prevent flicker
      // queryClient.invalidateQueries({ queryKey: branchKeys.lists() });

      toast.success(t("Branches.notifications.updateSuccess"));
    },
    onError: (error, variables) => {
      console.error("Failed to update branch:", error);
      toast.error(t("Branches.notifications.updateError"));
      // Attempt to revert by refetching the specific branch data
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(variables.id) });
      // And potentially refetch the list if the local state might be too out of sync
      // queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });

  // onChange handler for the DataSheetGrid
  const handleDatasheetChange = useCallback(
    (updatedData: Branch[], operations: DataSheetOperation[]) => {
      // Update local state immediately for responsive UI
      setDatasheetData(updatedData);

      // Process operations to find what changed and trigger API calls
      operations.forEach((op) => {
        // Example: Handle updates (most common case for cell edits)
        if (op.type === "UPDATE") {
          // Assuming UPDATE operation affects rows from fromRow to toRow
          for (let i = op.fromRow; i <= op.toRow; i++) {
            const changedBranch = updatedData[i];
            if (changedBranch && changedBranch.id) {
              // Extract only the changed fields if possible, or send the whole row
              // For simplicity, sending the relevant part of the row object
              // Ensure you are not sending fields that shouldn't be updated (like id, created_at)
              const {
                id: changedBranchId,
                created_at: _createdAt,
                ...updatePayload
              } = changedBranch;
              console.log("Updating branch:", changedBranchId, updatePayload);
              updateMutation.mutate({
                id: changedBranchId,
                data: updatePayload as BranchUpdateData,
              });
            } else {
              console.warn("Skipping update for row without ID:", i, changedBranch);
            }
          }
        }
        // TODO: Handle CREATE and DELETE operations if the datasheet supports them
        // else if (op.type === 'CREATE') { ... }
        // else if (op.type === 'DELETE') { ... }
      });
    },
    [updateMutation], // Add other dependencies if needed (like t)
  );

  // Effect to update local state if initialData changes from parent
  // Useful if the parent component refetches data externally
  useEffect(() => {
    setDatasheetData(initialData);
  }, [initialData]);

  return {
    datasheetData,
    handleDatasheetChange,
    // Expose mutation status if needed by the UI
    isUpdating: updateMutation.isPending,
  };
}
