import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createQuote,
  deleteQuote,
  fetchQuoteById,
  fetchQuotes,
  updateQuote,
  bulkDeleteQuotes,
} from "@/services/quoteService";

import { Quote } from "@/types/quote.type";

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
    queryKey: ["quotes", id],
    queryFn: () => fetchQuoteById(id),
    enabled: !!id, // Only run query if id is truthy
  });
}

// Hook for creating a new quote
export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newQuote: Omit<Quote, "id" | "created_at">) => createQuote(newQuote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

// Hook for updating a quote
export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quote> }) => updateQuote(id, data),
    onSuccess: (data) => {
      // queryClient.invalidateQueries({ queryKey: ["quotes", data.id] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

// Hook for deleting a quote
export function useDeleteQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuote,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      // queryClient.removeQueries({ queryKey: ["quotes", variables] });
    },
  });
}

// Hook for bulk deleting quotes
export const useBulkDeleteQuotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteQuotes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
};
