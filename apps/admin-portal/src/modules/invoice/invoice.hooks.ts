import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  bulkDeleteInvoices,
  createInvoice,
  deleteInvoice,
  fetchInvoiceById,
  fetchInvoices,
  updateInvoice,
  duplicateInvoice,
} from "@/invoice/invoice.service";
import { InvoiceCreateData, InvoiceUpdateData } from "@/invoice/invoice.type";

// Query keys
export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (filters: any) => [...invoiceKeys.lists(), { filters }] as const,
  details: () => [...invoiceKeys.all, "detail"] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};

// Hooks
export function useInvoices() {
  return useQuery({
    queryKey: invoiceKeys.lists(),
    queryFn: fetchInvoices,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => fetchInvoiceById(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InvoiceCreateData) => createInvoice(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() }),
    meta: { toast: { success: "Invoices.success.create", error: "Invoices.error.create" } },
  });
}

export function useDuplicateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateInvoice(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data.id) });
    },
    meta: { toast: { success: "Invoices.success.duplicate", error: "Invoices.error.duplicate" } },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InvoiceUpdateData }) => updateInvoice(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
    meta: { toast: { success: "Invoices.success.update", error: "Invoices.error.update" } },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.removeQueries({ queryKey: invoiceKeys.detail(variables) });
    },
    meta: { toast: { success: "Invoices.success.delete", error: "Invoices.error.delete" } },
  });
}

export function useBulkDeleteInvoices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteInvoices,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() }),
    meta: { toast: { success: "Invoices.success.delete", error: "Invoices.error.delete" } },
  });
}
