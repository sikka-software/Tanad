import type { Database } from "@/lib/database.types";

export type QuoteItem = Database["public"]["Tables"]["quote_items"]["Row"];

// Define the base type from the database row
export type Quote = Database["public"]["Tables"]["quotes"]["Row"] & {
  items?: QuoteItem[];
};
export type QuoteCreateData = Database["public"]["Tables"]["quotes"]["Insert"];
export type QuoteUpdateData = Database["public"]["Tables"]["quotes"]["Update"];
