import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

import {
  createPurchase,
  deletePurchase,
  fetchPurchaseById,
  fetchPurchases,
  updatePurchase,
  bulkDeletePurchases,
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
  const t = useTranslations();

  return useMutation({
    mutationFn: (newPurchase: PurchaseCreateData & { user_id: string }) => {
      // Map user_id to user_id for the service function
      const { user_id, ...rest } = newPurchase;
      const purchaseData: PurchaseCreateData = {
        ...rest,
        user_id: user_id,
      };
      return createPurchase(purchaseData);
    },
    onSuccess: () => {
      // Invalidate the list query to refetch
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
      toast.success(t("General.successful_operation"), {
        description: t("Purchases.success.create"),
      });
    },
  });
}

// Hook for updating an existing purchase
export function useUpdatePurchase() {
  const queryClient = useQueryClient();
  const t = useTranslations();

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
      toast.error(t("General.error_operation"), {
        description: t("Purchases.error.update"),
      });
    },
    onSettled: (data, error, { id }) => {
      // Invalidate queries to ensure eventual consistency
      queryClient.invalidateQueries({ queryKey: purchaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });

      // Show success toast only if the mutation succeeded
      if (!error && data) {
        toast.success(t("General.successful_operation"), {
          description: t("Purchases.success.update"),
        });
      }
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
  });
}

// Hook for deleting a purchase
export function useDeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePurchase(id),
    onSuccess: (_, variables) => {
      // Invalidate the list and remove the specific detail query from cache
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
      queryClient.removeQueries({ queryKey: purchaseKeys.detail(variables) });
    },
  });
}

// Hook for bulk deleting purchases
export function useBulkDeletePurchases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeletePurchases,
    onSuccess: () => {
      // Invalidate the list query
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
    },
  });
}
