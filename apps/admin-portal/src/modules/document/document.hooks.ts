import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import {
  createDocument,
  fetchDocumentById,
  fetchDocuments,
  updateDocument,
  duplicateDocument,
} from "@/document/document.service";
import type { Document, DocumentCreateData, DocumentUpdateData } from "@/document/document.type";

// Query keys for documents
export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (filters: any) => [...documentKeys.lists(), { filters }] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
};

// Hook to fetch all documents
export function useDocuments() {
  return useQuery({
    queryKey: documentKeys.lists(),
    queryFn: fetchDocuments,
  });
}

// Hook to fetch a single document by ID
export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => fetchDocumentById(id),
    enabled: !!id, // Only run query if id is truthy
  });
}

// Hook for creating a new document
export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newDocument: DocumentCreateData) => createDocument(newDocument),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.lists() }),
    meta: {
      operation: "create",
      toast: { success: "Documents.success.create", error: "Documents.error.create" },
    },
  });
}

// Hook for updating an existing document
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DocumentUpdateData }) =>
      updateDocument(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: documentKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: documentKeys.lists() });

      // Snapshot the previous value
      const previousDocument = queryClient.getQueryData<Document>(documentKeys.detail(id));
      const previousDocuments = queryClient.getQueryData<Document[]>(documentKeys.lists());

      // Optimistically update to the new value
      // Update detail cache
      if (previousDocument) {
        queryClient.setQueryData<Document>(documentKeys.detail(id), {
          ...previousDocument,
          ...data,
          // Ensure created_at is preserved if not part of the update
          created_at: previousDocument.created_at,
        });
      }

      // Update list cache
      if (previousDocuments) {
        queryClient.setQueryData<Document[]>(
          documentKeys.lists(),
          previousDocuments.map((document) =>
            document.id === id
              ? { ...document, ...data, created_at: document.created_at } // Preserve created_at here too
              : document,
          ),
        );
      }

      // Return a context object with the snapshotted value
      return { previousDocument, previousDocuments };
    },
    onError: (err, { id }, context) => {
      console.error("Update failed:", err);
      if (context?.previousDocument) {
        queryClient.setQueryData(documentKeys.detail(id), context.previousDocument);
      }
      if (context?.previousDocuments) {
        queryClient.setQueryData(documentKeys.lists(), context.previousDocuments);
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
    meta: {
      operation: "update",
      toast: { success: "Documents.success.update", error: "Documents.error.update" },
    },
  });
}

// Hook for duplicating a document
export function useDuplicateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateDocument(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
    meta: {
      operation: "duplicate",
      toast: { success: "Documents.success.duplicate", error: "Documents.error.duplicate" },
    },
  });
}

// Hook for deleting a document
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteResourceById(`/api/resource/documents/${id}`),
    onSuccess: (_, variables) => {
      // Invalidate the list and remove the specific detail query from cache
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.removeQueries({ queryKey: documentKeys.detail(variables) });
    },
    meta: {
      operation: "delete",
      toast: { success: "Documents.success.delete", error: "Documents.error.delete" },
    },
  });
}

// Hook for bulk deleting documents
export function useBulkDeleteDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteResource("/api/resource/documents", ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.lists() }),
    meta: {
      operation: "delete",
      toast: { success: "Documents.success.delete", error: "Documents.error.delete" },
    },
  });
}
