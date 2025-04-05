import { supabase } from '@/lib/supabase';
import { Client } from './clients';

export interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number | null;
  tax_amount: number | null;
  total: number;
  status: string;
  notes: string | null;
  client_id: string;
  client: Client;
  created_at: string;
}

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
    throw new Error(error.message);
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
    throw new Error(error.message);
  }

  return data;
}

export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'client'>): Promise<Invoice> {
  const { data, error } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateInvoice(
  id: string, 
  invoice: Partial<Omit<Invoice, 'id' | 'created_at' | 'client'>>
): Promise<Invoice> {
  const { data, error } = await supabase
    .from('invoices')
    .update(invoice)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
} 