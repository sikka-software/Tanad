import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createExpense,
  deleteExpense,
  fetchExpenseById,
  fetchExpenses,
  updateExpense,
  bulkDeleteExpenses,
} from "@/modules/expense/expense.service";
import type { Expense, ExpenseCreateData } from "@/modules/expense/expense.type";

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

// Hook to fetch a single expense by ID
export function useExpense(id: string) {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => fetchExpenseById(id),
    enabled: !!id, // Only run query if id is truthy
  });
}

// Hook for creating a new expense
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newExpense: Omit<Expense, "id" | "created_at"> & { user_id: string }) => {
      // Map user_id to user_id for the service function
      const { user_id, ...rest } = newExpense;
      const expenseData: ExpenseCreateData = {
        ...rest,
        user_id: user_id,
      };
      return createExpense(expenseData);
    },
    onSuccess: () => {
      // Invalidate the list query to refetch
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}

// Hook for updating an existing expense
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      expense,
    }: {
      id: string;
      expense: Partial<Omit<Expense, "id" | "created_at">>;
    }) => updateExpense(id, expense),
    onSuccess: (data: Expense) => {
      // Invalidate both the specific detail and the list queries
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}

// Hook for deleting an expense
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: (_, variables) => {
      // Invalidate the list and remove the specific detail query from cache
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.removeQueries({ queryKey: expenseKeys.detail(variables) });
    },
  });
}

// Hook for bulk deleting expenses
export function useBulkDeleteExpenses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteExpenses,
    onSuccess: () => {
      // Invalidate the list query
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}
