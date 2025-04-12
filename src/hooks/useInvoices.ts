import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Invoice, InvoiceCreateData } from '@/types/invoice.type';
import { 
  createInvoice, 
  deleteInvoice, 
  fetchInvoiceById, 
  fetchInvoices, 
  updateInvoice 
} from '@/services/invoiceService';
import { useEffect } from "react";
import { useInvoicesStore } from "@/stores/invoices.store";

// Query keys
export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (filters: any) => [...invoiceKeys.lists(), { filters }] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};

// Hooks
export function useInvoices() {
  const { invoices, isLoading, error, fetchInvoices } = useInvoicesStore();

  useEffect(() => {
    if (invoices.length === 0 && !isLoading) {
      fetchInvoices();
    }
  }, [fetchInvoices, invoices.length, isLoading]);

  return {
    data: invoices,
    isLoading,
    error,
    refetch: fetchInvoices,
  };
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
    mutationFn: (newInvoice: InvoiceCreateData) => createInvoice(newInvoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, invoice }: { id: string; invoice: Partial<Invoice> }) => 
      updateInvoice(id, invoice),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.removeQueries({ queryKey: invoiceKeys.detail(variables) });
    },
  });
} 