import { supabase } from '@/lib/supabase';
import { Invoice, InvoiceCreateData } from '@/types/invoice.type';

export async function fetchInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:client_id (
        id,
        name,
        company,
        email,
        phone
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
    throw new Error('Failed to fetch invoices');
  }

  return data || [];
}

export async function fetchInvoiceById(id: string): Promise<Invoice> {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:client_id (
        id,
        name,
        company,
        email,
        phone
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching invoice with id ${id}:`, error);
    throw new Error(`Failed to fetch invoice with id ${id}`);
  }

  return data;
}

export async function createInvoice(invoice: InvoiceCreateData): Promise<Invoice> {
  const dbInvoice = { ...invoice };
  if (invoice.userId) {
    (dbInvoice as any).user_id = invoice.userId;
    delete (dbInvoice as any).userId;
  }

  const { data, error } = await supabase
    .from('invoices')
    .insert([dbInvoice])
    .select()
    .single();

  if (error) {
    console.error('Error creating invoice:', error);
    throw new Error('Failed to create invoice');
  }

  return data;
}

export async function updateInvoice(
  id: string, 
  invoice: Partial<Invoice>
): Promise<Invoice> {
  const { data, error } = await supabase
    .from('invoices')
    .update(invoice)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating invoice with id ${id}:`, error);
    throw new Error(`Failed to update invoice with id ${id}`);
  }

  return data;
}

export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting invoice with id ${id}:`, error);
    throw new Error(`Failed to delete invoice with id ${id}`);
  }
} 