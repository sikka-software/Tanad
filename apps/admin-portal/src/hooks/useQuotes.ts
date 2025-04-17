import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createQuote,
  deleteQuote,
  fetchQuoteById,
  fetchQuotes,
  updateQuote,
} from "@/services/quoteService";
import type { Quote } from "@/types/quote.type";

// Query keys for quotes
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
    queryKey: ["quotes"],
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

// Hook for creating a new quote
export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newQuote: Omit<Quote, "id" | "created_at">) => {
      return createQuote(newQuote);
    },
    onSuccess: () => {
      // Invalidate the list query to refetch
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}

// Hook for updating a quote
export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quote> }) => {
      return updateQuote(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}

// Hook for deleting a quote
export function useDeleteQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}

// Hook for bulk deleting quotes
export const useBulkDeleteQuotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch("/api/quotes/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete quotes");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
};
