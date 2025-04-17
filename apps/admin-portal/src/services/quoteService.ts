import { eq, inArray } from "drizzle-orm";

import { Quote, QuoteItem, QuoteCreateData, QuoteItemCreateData } from "@/types/quote.type";

import { db } from "@/db/drizzle";
import { quotes } from "@/db/schema";

// Helper function to convert database quote to Quote type
function convertDbQuoteToQuote(dbQuote: any): Quote {
  return {
    id: dbQuote.id,
    created_at: dbQuote.created_at,
    quote_number: dbQuote.quoteNumber,
    issue_date: dbQuote.issueDate,
    expiry_date: dbQuote.expiryDate,
    status: dbQuote.status,
    subtotal: Number(dbQuote.subtotal),
    tax_rate: dbQuote.taxRate ? Number(dbQuote.taxRate) : 0,
    tax_amount: dbQuote.taxAmount ? Number(dbQuote.taxAmount) : 0,
    total: dbQuote.total ? Number(dbQuote.total) : 0,
    notes: dbQuote.notes,
    client_id: dbQuote.client_id,
  };
}

// Helper function to convert Quote type to database quote
function convertQuoteToDbQuote(quote: QuoteCreateData): any {
  return {
    quoteNumber: quote.quote_number,
    issueDate: quote.issue_date,
    expiryDate: quote.expiry_date,
    status: quote.status,
    subtotal: quote.subtotal.toString(),
    taxRate: quote.tax_rate.toString(),
    taxAmount: quote.tax_amount.toString(),
    total: quote.total.toString(),
    notes: quote.notes,
    client_id: quote.client_id,
    user_id: quote.user_id,
  };
}

export async function fetchQuotes(): Promise<Quote[]> {
  const response = await fetch("/api/quotes");
  if (!response.ok) {
    throw new Error("Failed to fetch quotes");
  }
  return response.json();
}

export async function fetchQuoteById(id: string): Promise<Quote> {
  const response = await fetch(`/api/quotes/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch quote");
  }
  return response.json();
}

export async function createQuote(newQuote: QuoteCreateData): Promise<Quote> {
  const response = await fetch("/api/quotes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newQuote),
  });
  if (!response.ok) {
    throw new Error("Failed to create quote");
  }
  return response.json();
}

export async function updateQuote(id: string, updates: Partial<Quote>): Promise<Quote> {
  const response = await fetch(`/api/quotes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error("Failed to update quote");
  }
  return response.json();
}

export async function deleteQuote(id: string): Promise<void> {
  const response = await fetch(`/api/quotes/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete quote");
  }
}

export async function bulkDeleteQuotes(ids: string[]): Promise<void> {
  const response = await fetch("/api/quotes/bulk-delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    throw new Error("Failed to delete quotes");
  }
}

// Quote Items API endpoints
export async function createQuoteItem(quoteItem: QuoteItemCreateData) {
  try {
    const dbQuoteItem = {
      quoteId: quoteItem.quote_id,
      description: quoteItem.description,
      quantity: quoteItem.quantity.toString(),
      unitPrice: quoteItem.unit_price.toString(),
    };

    const response = await fetch("/api/quote-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dbQuoteItem),
    });

    if (!response.ok) {
      throw new Error("Failed to create quote item");
    }

    return response.json();
  } catch (error) {
    console.error("Error creating quote item:", error);
    throw new Error("Failed to create quote item");
  }
}

export async function updateQuoteItem(id: string, quoteItem: Partial<QuoteItem>) {
  try {
    const dbQuoteItem = {
      ...(quoteItem.quote_id && { quoteId: quoteItem.quote_id }),
      ...(quoteItem.description && { description: quoteItem.description }),
      ...(quoteItem.quantity && { quantity: quoteItem.quantity.toString() }),
      ...(quoteItem.unit_price && { unitPrice: quoteItem.unit_price.toString() }),
    };

    const response = await fetch(`/api/quote-items/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dbQuoteItem),
    });

    if (!response.ok) {
      throw new Error(`Failed to update quote item with id ${id}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error updating quote item ${id}:`, error);
    throw new Error(`Failed to update quote item with id ${id}`);
  }
}

export async function deleteQuoteItem(id: string) {
  try {
    const response = await fetch(`/api/quote-items/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete quote item with id ${id}`);
    }
  } catch (error) {
    console.error(`Error deleting quote item ${id}:`, error);
    throw new Error(`Failed to delete quote item with id ${id}`);
  }
}
