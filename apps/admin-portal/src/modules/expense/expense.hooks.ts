import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createExpense,
  deleteExpense,
  bulkDeleteExpenses,
  fetchExpenseById,
  fetchExpenses,
  updateExpense,
  duplicateExpense,
} from "@/expense/expense.service";
import type { Expense, ExpenseCreateData } from "@/expense/expense.type";

// Query keys for expenses
export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (filters: any) => [...expenseKeys.lists(), { filters }] as const,
  details: () => [...expenseKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
};

// Hook to fetch all expenses
export function useExpenses() {
  return useQuery({
    queryKey: expenseKeys.lists(),
    queryFn: fetchExpenses,
  });
}

// Hook to fetch a single expense
export function useExpense(id: string) {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => fetchExpenseById(id),
    enabled: !!id,
  });
}

// Hook to create a expense
export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expense: ExpenseCreateData) => createExpense(expense),
    onSuccess: (newExpense: Expense) => {
      const previousExpenses = queryClient.getQueryData(expenseKeys.lists()) || [];
      queryClient.setQueryData(expenseKeys.lists(), [
        ...(Array.isArray(previousExpenses) ? previousExpenses : []),
        newExpense,
      ]);
    },
  });
}

// Hook to update a expense
export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Expense> }) => updateExpense(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}

// Hook to duplicate a expense
export function useDuplicateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateExpense(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}

// Hook to delete a expense
export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.removeQueries({ queryKey: expenseKeys.detail(variables) });
    },
  });
}

// Hook to bulk delete expenses
export function useBulkDeleteExpenses() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteExpenses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}
