import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  bulkDeleteProducts,
  createProduct,
  deleteProduct,
  fetchProductById,
  fetchProducts,
  updateProduct,
  duplicateProduct,
} from "@/product/product.service";
import type { Product, ProductUpdateData, ProductCreateData } from "@/product/product.type";

// Query keys for products
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: any) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Hook to fetch all products
export function useProducts() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: fetchProducts,
  });
}

// Hook to fetch a single product by ID
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
    enabled: !!id, // Only run query if id is truthy
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newProduct: ProductCreateData) => createProduct(newProduct),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
    meta: {
      operation: "create",
      toast: { success: "Products.success.create", error: "Products.error.create" },
    },
  });
}

// Hook for duplicating a product
export function useDuplicateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
    meta: {
      operation: "duplicate",
      toast: { success: "Products.success.duplicate", error: "Products.error.duplicate" },
    },
  });
}

// Hook for updating an existing product
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdateData }) => updateProduct(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });

      // Snapshot the previous value
      const previousProduct = queryClient.getQueryData<Product>(productKeys.detail(id));
      const previousProducts = queryClient.getQueryData<Product[]>(productKeys.lists());

      // Optimistically update to the new value
      // Update detail cache
      if (previousProduct) {
        queryClient.setQueryData<Product>(productKeys.detail(id), {
          ...previousProduct,
          ...data,
          // Ensure created_at is preserved if not part of the update
          created_at: previousProduct.created_at,
        });
      }

      // Update list cache
      if (previousProducts) {
        queryClient.setQueryData<Product[]>(
          productKeys.lists(),
          previousProducts.map((product) =>
            product.id === id
              ? { ...product, ...data, created_at: product.created_at } // Preserve created_at here too
              : product,
          ),
        );
      }

      // Return a context object with the snapshotted value
      return { previousProduct, previousProducts };
    },
    onError: (err, { id }, context) => {
      console.error("Update failed:", err);
      if (context?.previousProduct) {
        queryClient.setQueryData(productKeys.detail(id), context.previousProduct);
      }
      if (context?.previousProducts) {
        queryClient.setQueryData(productKeys.lists(), context.previousProducts);
      }
    },
    onSettled: (data, error, { id }) => {
      // Invalidate queries to ensure eventual consistency
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    meta: {
      operation: "update",
      toast: { success: "Products.success.update", error: "Products.error.update" },
    },
  });
}

// Hook for deleting a product
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.removeQueries({ queryKey: productKeys.detail(variables) });
    },
    meta: {
      operation: "delete",
      toast: { success: "Products.success.delete", error: "Products.error.delete" },
    },
  });
}
export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteProducts,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
    meta: {
      operation: "delete",
      toast: { success: "Products.success.delete", error: "Products.error.delete" },
    },
  });
}
