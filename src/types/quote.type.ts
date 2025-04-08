import { Client } from "./client.type";

export interface Quote {
  id: string;
  created_at: string;
  quote_number: string;
  issue_date: string;
  expiry_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: string;
  notes?: string;
  client_id: string;
  clients?: Client;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export type QuoteCreateData = Omit<Quote, "id" | "created_at" | "clients"> & {
  userId?: string;
};

export type QuoteItemCreateData = Omit<QuoteItem, "id">;
