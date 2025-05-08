import type { Database } from "@/lib/database.types";

// This is the type for an item fetched from the DB, associated with a quote
export type QuoteItem = Database["public"]["Tables"]["quote_items"]["Row"];

// Represents an item's fields that are managed by the form/client for creation,
// excluding DB-generated fields like quote_id, id, created_at, amount.
// Importantly, quantity and unit_price here should align with form expectations (ideally numbers).
export type QuoteItemClientData = Omit<
  Database["public"]["Tables"]["quote_items"]["Insert"],
  "quote_id" | "id" | "created_at" | "amount"
> & {
  // Ensure quantity and unit_price are numbers if that's the goal for the form
  quantity: number;
  unit_price: number;
};

// Define the base type from the database row, augmented with its items
export type Quote = Database["public"]["Tables"]["quotes"]["Row"] & {
  items?: QuoteItem[]; // These are QuoteItem from DB
};

// For creating a new quote
export type QuoteCreateData = Omit<Database["public"]["Tables"]["quotes"]["Insert"], "notes" | "subtotal" | "tax_amount" | "total"> & {
  items: QuoteItemClientData[];
  notes?: string | null; // Align notes with form usage (string) instead of Json
  // subtotal, tax_amount, total are usually calculated on backend or just before insert
};

// For updating an existing quote
export type QuoteUpdateData = Omit<Database["public"]["Tables"]["quotes"]["Update"], "notes" | "subtotal" | "tax_amount" | "total"> & {
  id: string; // Explicitly require id for update payloads
  items?: (QuoteItemClientData & { id?: string })[]; // Items can be new (no id) or existing (with id)
  notes?: string | null; // Align notes with form usage
};
