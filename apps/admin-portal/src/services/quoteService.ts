import { Quote, QuoteItem, QuoteCreateData, QuoteItemCreateData } from "@/types/quote.type";

export async function fetchQuotes(): Promise<Quote[]> {
  try {
    const response = await fetch("/api/quotes");
    if (!response.ok) {
      throw new Error("Failed to fetch quotes");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching quotes:", error);
    throw new Error("Failed to fetch quotes");
  }
}

export async function fetchQuoteById(id: string): Promise<Quote> {
  try {
    const response = await fetch(`/api/quotes/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch quote");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching quote:", error);
    throw new Error("Failed to fetch quote");
  }
}

export async function createQuote(newQuote: QuoteCreateData): Promise<Quote> {
  try {
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
  } catch (error) {
    console.error("Error creating quote:", error);
    throw new Error("Failed to create quote");
  }
}

export async function updateQuote(id: string, updates: Partial<Quote>): Promise<Quote> {
  try {
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
  } catch (error) {
    console.error("Error updating quote:", error);
    throw new Error("Failed to update quote");
  }
}

export async function deleteQuote(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/quotes/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete quote");
    }
  } catch (error) {
    console.error("Error deleting quote:", error);
    throw new Error("Failed to delete quote");
  }
}

export async function bulkDeleteQuotes(ids: string[]): Promise<void> {
  try {
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
  } catch (error) {
    console.error("Error deleting quotes:", error);
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
