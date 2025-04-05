import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Invoice, 
  createInvoice, 
  deleteInvoice, 
  fetchInvoiceById, 
  fetchInvoices, 
  updateInvoice 
} from '@/api/invoices';

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
    mutationFn: (newInvoice: Omit<Invoice, 'id' | 'created_at' | 'client'>) => 
      createInvoice(newInvoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, invoice }: { id: string; invoice: Partial<Omit<Invoice, 'id' | 'created_at' | 'client'>> }) => 
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