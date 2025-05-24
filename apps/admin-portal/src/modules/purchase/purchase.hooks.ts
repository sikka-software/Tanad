import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import {
  createPurchase,
  fetchPurchaseById,
  fetchPurchases,
  updatePurchase,
  duplicatePurchase,
} from "@/purchase/purchase.service";
import type { Purchase, PurchaseCreateData, PurchaseUpdateData } from "@/purchase/purchase.type";

// Query keys for purchases
export const purchaseKeys = {
  all: ["purchases"] as const,
  lists: () => [...purchaseKeys.all, "list"] as const,
  list: (filters: any) => [...purchaseKeys.lists(), { filters }] as const,
  details: () => [...purchaseKeys.all, "detail"] as const,
  detail: (id: string) => [...purchaseKeys.details(), id] as const,
};

// Hook to fetch all purchases
export function usePurchases() {
  return useQuery({
    queryKey: purchaseKeys.lists(),
    queryFn: fetchPurchases,
  });
}

// Hook to fetch a single purchase by ID
export function usePurchase(id: string) {
  return useQuery({
    queryKey: purchaseKeys.detail(id),
    queryFn: () => fetchPurchaseById(id),
    enabled: !!id, // Only run query if id is truthy
  });
}

// Hook for creating a new purchase
export function useCreatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPurchase: PurchaseCreateData) => createPurchase(newPurchase),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() }),
    meta: {
      operation: "create",
      toast: { success: "Purchases.success.create", error: "Purchases.error.create" },
    },
  });
}

// Hook for updating an existing purchase
export function useUpdatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PurchaseUpdateData }) =>
      updatePurchase(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: purchaseKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: purchaseKeys.lists() });

      // Snapshot the previous value
      const previousPurchase = queryClient.getQueryData<Purchase>(purchaseKeys.detail(id));
      const previousPurchases = queryClient.getQueryData<Purchase[]>(purchaseKeys.lists());

      // Optimistically update to the new value
      // Update detail cache
      if (previousPurchase) {
        queryClient.setQueryData<Purchase>(purchaseKeys.detail(id), {
          ...previousPurchase,
          ...data,
          // Ensure created_at is preserved if not part of the update
          created_at: previousPurchase.created_at,
        });
      }

      // Update list cache
      if (previousPurchases) {
        queryClient.setQueryData<Purchase[]>(
          purchaseKeys.lists(),
          previousPurchases.map((purchase) =>
            purchase.id === id
              ? { ...purchase, ...data, created_at: purchase.created_at } // Preserve created_at here too
              : purchase,
          ),
        );
      }

      // Return a context object with the snapshotted value
      return { previousPurchase, previousPurchases };
    },
    onError: (err, { id }, context) => {
      console.error("Update failed:", err);
      if (context?.previousPurchase) {
        queryClient.setQueryData(purchaseKeys.detail(id), context.previousPurchase);
      }
      if (context?.previousPurchases) {
        queryClient.setQueryData(purchaseKeys.lists(), context.previousPurchases);
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
    },
    meta: {
      operation: "update",
      toast: { success: "Purchases.success.update", error: "Purchases.error.update" },
    },
  });
}

// Hook for duplicating a purchase
export function useDuplicatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicatePurchase(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
    },
    meta: {
      operation: "duplicate",
      toast: { success: "Purchases.success.duplicate", error: "Purchases.error.duplicate" },
    },
  });
}

// Hook for deleting a purchase
export function useDeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteResourceById(`/api/resource/purchases/${id}`),
    onSuccess: (_, variables) => {
      // Invalidate the list and remove the specific detail query from cache
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
      queryClient.removeQueries({ queryKey: purchaseKeys.detail(variables) });
    },
    meta: {
      operation: "delete",
      toast: { success: "Purchases.success.delete", error: "Purchases.error.delete" },
    },
  });
}

// Hook for bulk deleting purchases
export function useBulkDeletePurchases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteResource("/api/resource/purchases", ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() }),
    meta: {
      operation: "delete",
      toast: { success: "Purchases.success.delete", error: "Purchases.error.delete" },
    },
  });
}
