import { supabase } from '@/lib/supabase';
import { Client } from './clients';

export interface Quote {
  id: string;
  quote_number: string;
  issue_date: string;
  expiry_date: string;
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

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  quote_id: string;
  created_at: string;
}

export async function fetchQuotes(): Promise<Quote[]> {
  const { data, error } = await supabase
    .from('quotes')
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

export async function fetchQuoteById(id: string): Promise<Quote> {
  const { data, error } = await supabase
    .from('quotes')
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

export async function createQuote(quote: Omit<Quote, 'id' | 'created_at' | 'client'>) {
  const { data, error } = await supabase
    .from('quotes')
    .insert([quote])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateQuote(id: string, quote: Partial<Quote>) {
  const { data, error } = await supabase
    .from('quotes')
    .update(quote)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteQuote(id: string) {
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createQuoteItem(quoteItem: Omit<QuoteItem, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('quote_items')
    .insert([quoteItem])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateQuoteItem(id: string, quoteItem: Partial<QuoteItem>) {
  const { data, error } = await supabase
    .from('quote_items')
    .update(quoteItem)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteQuoteItem(id: string) {
  const { error } = await supabase
    .from('quote_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
} 