import type { Database } from "@/lib/database.types";

import { Client } from "@/client/client.type";

// Define the base type from the database row
type QuoteRow = Database["public"]["Tables"]["quotes"]["Row"];

// Extend the base type to include the related Client object
export type Quote = QuoteRow & {
  client?: Client; // Making it optional in case the join is sometimes omitted
};

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export type QuoteCreateData = Omit<Quote, "id" | "created_at" | "client"> & {
  user_id?: string;
};

export type QuoteUpdateData = Partial<Quote>;
export type QuoteItemCreateData = Omit<QuoteItem, "id">;
