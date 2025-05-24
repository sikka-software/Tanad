import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBankAccount,
  deleteBankAccount,
  fetchBankAccountById,
  fetchBankAccounts,
  updateBankAccount,
} from "@/bank_account/bank_account.service";
import type {
  BankAccountCreateData,
  BankAccountUpdateData,
} from "@/bank_account/bank_account.type";

// Query keys for cars
export const bankAccountKeys = {
  all: ["bank_accounts"] as const,
  lists: () => [...bankAccountKeys.all, "list"] as const,
  list: (filters: any) => [...bankAccountKeys.lists(), { filters }] as const,
  details: () => [...bankAccountKeys.all, "detail"] as const,
  detail: (id: string) => [...bankAccountKeys.details(), id] as const,
};

// Hook to fetch all bank accounts
export function useBankAccounts() {
  return useQuery({
    queryKey: bankAccountKeys.lists(),
    queryFn: fetchBankAccounts,
  });
}

// Hook to fetch a single bank account by ID
export function useBankAccount(id: string) {
  return useQuery({
    queryKey: bankAccountKeys.detail(id),
    queryFn: () => fetchBankAccountById(id),
    enabled: !!id, // Only run query if id is truthy
  });
}

// Hook for creating a new car
export function useCreateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newBankAccount: BankAccountCreateData) => createBankAccount(newBankAccount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() }),
    meta: {
      operation: "create",
      toast: { success: "BankAccounts.success.create", error: "BankAccounts.error.create" },
    },
  });
}

// Hook for updating an existing bank account
export function useUpdateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BankAccountUpdateData }) =>
      updateBankAccount(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() });
    },
    meta: {
      operation: "update",
      toast: { success: "BankAccounts.success.update", error: "BankAccounts.error.update" },
    },
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBankAccount(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() });
      queryClient.removeQueries({ queryKey: bankAccountKeys.detail(variables) });
    },
    meta: {
      operation: "delete",
      toast: { success: "BankAccounts.success.delete", error: "BankAccounts.error.delete" },
    },
  });
}
