import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import {
  createQuote,
  fetchQuoteById,
  fetchQuotes,
  updateQuote,
  duplicateQuote,
} from "@/quote/quote.service";
import { QuoteCreateData, QuoteUpdateData } from "@/quote/quote.type";

export const quoteKeys = {
  all: ["quotes"] as const,
  lists: () => [...quoteKeys.all, "list"] as const,
  list: (filters: any) => [...quoteKeys.lists(), { filters }] as const,
  details: () => [...quoteKeys.all, "detail"] as const,
  detail: (id: string) => [...quoteKeys.details(), id] as const,
};

// Hook to fetch all quotes
export function useQuotes() {
  return useQuery({
    queryKey: quoteKeys.lists(),
    queryFn: fetchQuotes,
  });
}

// Hook to fetch a single quote by ID
export function useQuote(id: string) {
  return useQuery({
    queryKey: quoteKeys.detail(id),
    queryFn: () => fetchQuoteById(id),
    enabled: !!id, // Only run query if id is truthy
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newQuote: QuoteCreateData) => createQuote(newQuote),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: quoteKeys.lists() }),
    meta: {
      operation: "create",
      toast: { success: "Quotes.success.create", error: "Quotes.error.create" },
    },
  });
}

// Hook for duplicating a quote
export function useDuplicateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateQuote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: quoteKeys.lists() }),
    meta: {
      operation: "duplicate",
      toast: { success: "Quotes.success.duplicate", error: "Quotes.error.duplicate" },
    },
  });
}

// Hook for updating a quote
export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: QuoteUpdateData }) => updateQuote(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
    meta: {
      operation: "update",
      toast: { success: "Quotes.success.update", error: "Quotes.error.update" },
    },
  });
}

// Hook for deleting a quote
export function useDeleteQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteResourceById(`/api/resource/quotes/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
      queryClient.removeQueries({ queryKey: quoteKeys.detail(variables) });
    },
    meta: {
      operation: "delete",
      toast: { success: "Quotes.success.delete", error: "Quotes.error.delete" },
    },
  });
}

// Hook for bulk deleting quotes
export const useBulkDeleteQuotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteResource("/api/resource/quotes", ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: quoteKeys.lists() }),
    meta: {
      operation: "delete",
      toast: { success: "Quotes.success.delete", error: "Quotes.error.delete" },
    },
  });
};
