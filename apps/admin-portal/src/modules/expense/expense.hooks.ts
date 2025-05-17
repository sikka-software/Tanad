import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteResourceById, bulkDeleteResource } from "@/lib/api";

import {
  createExpense,
  fetchExpenseById,
  fetchExpenses,
  updateExpense,
  duplicateExpense,
} from "@/expense/expense.service";
import type { ExpenseCreateData, ExpenseUpdateData } from "@/expense/expense.type";

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

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expense: ExpenseCreateData) => createExpense(expense),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.lists() }),
    meta: { toast: { success: "Expenses.success.create", error: "Expenses.error.create" } },
  });
}

// Hook to update a expense
export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseUpdateData }) => updateExpense(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
    meta: { toast: { success: "Expenses.success.update", error: "Expenses.error.update" } },
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
    meta: { toast: { success: "Expenses.success.duplicate", error: "Expenses.error.duplicate" } },
  });
}

// Hook to delete a expense
export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResourceById(`/api/resource/expenses/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.removeQueries({ queryKey: expenseKeys.detail(variables) });
    },
    meta: { toast: { success: "Expenses.success.delete", error: "Expenses.error.delete" } },
  });
}

// Hook to bulk delete expenses
export function useBulkDeleteExpenses() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteResource("/api/resource/expenses", ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
    meta: { toast: { success: "Expenses.success.delete", error: "Expenses.error.delete" } },
  });
}
