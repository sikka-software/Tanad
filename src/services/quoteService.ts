import { supabase } from "@/lib/supabase";
import { Quote, QuoteItem, QuoteCreateData, QuoteItemCreateData } from "@/types/quote.type";

export async function fetchQuotes(): Promise<Quote[]> {
  const { data, error } = await supabase
    .from("quotes")
    .select(
      `
      *,
      clients!quotes_client_id_fkey (
        id,
        name,
        company,
        email,
        phone
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching quotes:", error);
    throw new Error("Failed to fetch quotes");
  }

  return data || [];
}

export async function fetchQuoteById(id: string): Promise<Quote> {
  const { data, error } = await supabase
    .from("quotes")
    .select(
      `
      *,
      clients!quotes_client_id_fkey (
        id,
        name,
        company,
        email,
        phone
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching quote with id ${id}:`, error);
    throw new Error(`Failed to fetch quote with id ${id}`);
  }

  return data;
}

export async function createQuote(quote: QuoteCreateData) {
  const dbQuote = { ...quote };
  if (quote.userId) {
    (dbQuote as any).user_id = quote.userId;
    delete (dbQuote as any).userId;
  }

  const { data, error } = await supabase.from("quotes").insert([dbQuote]).select().single();

  if (error) {
    console.error("Error creating quote:", error);
    throw new Error("Failed to create quote");
  }

  return data;
}

export async function updateQuote(id: string, quote: Partial<Quote>) {
  const { data, error } = await supabase
    .from("quotes")
    .update(quote)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating quote with id ${id}:`, error);
    throw new Error(`Failed to update quote with id ${id}`);
  }

  return data;
}

export async function deleteQuote(id: string) {
  const { error } = await supabase.from("quotes").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting quote with id ${id}:`, error);
    throw new Error(`Failed to delete quote with id ${id}`);
  }
}

export async function createQuoteItem(quoteItem: QuoteItemCreateData) {
  const { data, error } = await supabase.from("quote_items").insert([quoteItem]).select().single();

  if (error) {
    console.error("Error creating quote item:", error);
    throw new Error("Failed to create quote item");
  }

  return data;
}

export async function updateQuoteItem(id: string, quoteItem: Partial<QuoteItem>) {
  const { data, error } = await supabase
    .from("quote_items")
    .update(quoteItem)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating quote item with id ${id}:`, error);
    throw new Error(`Failed to update quote item with id ${id}`);
  }

  return data;
}

export async function deleteQuoteItem(id: string) {
  const { error } = await supabase.from("quote_items").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting quote item with id ${id}:`, error);
    throw new Error(`Failed to delete quote item with id ${id}`);
  }

  return true;
}
