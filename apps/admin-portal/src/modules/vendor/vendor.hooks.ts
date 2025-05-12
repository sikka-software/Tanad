import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  bulkDeleteVendors,
  createVendor,
  deleteVendor,
  fetchVendorById,
  fetchVendors,
  updateVendor,
  duplicateVendor,
} from "@/vendor/vendor.service";
import type { VendorCreateData, VendorUpdateData } from "@/vendor/vendor.type";

// Query keys for vendors
export const vendorKeys = {
  all: ["vendors"] as const,
  lists: () => [...vendorKeys.all, "list"] as const,
  list: (filters: any) => [...vendorKeys.lists(), { filters }] as const, // Keep filter structure if needed
  details: () => [...vendorKeys.all, "detail"] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
};

// Hook to fetch all vendors
export function useVendors() {
  return useQuery({
    queryKey: vendorKeys.lists(),
    queryFn: fetchVendors,
  });
}

// Hook to fetch a single vendor by ID
export function useVendor(id: string) {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: () => fetchVendorById(id),
    enabled: !!id, // Only run query if id is truthy
  });
}

// Hook for creating a new vendor
export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newVendor: VendorCreateData) => createVendor(newVendor),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vendorKeys.lists() }),
    meta: { toast: { success: "Vendors.success.create", error: "Vendors.error.create" } },
  });
}

// Hook for duplicating a vendor
export function useDuplicateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateVendor(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vendorKeys.lists() }),
    meta: { toast: { success: "Vendors.success.duplicate", error: "Vendors.error.duplicate" } },
  });
}

// Hook for updating an existing vendor
export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, vendor }: { id: string; vendor: VendorUpdateData }) =>
      updateVendor(id, vendor),
    onSuccess: (data) => {
      // Invalidate both the specific detail and the list queries
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
    meta: { toast: { success: "Vendors.success.update", error: "Vendors.error.update" } },
  });
}

// Hook for deleting a vendor
export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: (_, variables) => {
      // Invalidate the list and remove the specific detail query from cache
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.removeQueries({ queryKey: vendorKeys.detail(variables) });
    },
    meta: { toast: { success: "Vendors.success.delete", error: "Vendors.error.delete" } },
  });
}

// Hook to bulk delete vendors
export function useBulkDeleteVendors() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteVendors,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
    meta: { toast: { success: "Vendors.success.delete", error: "Vendors.error.delete" } },
  });
}
