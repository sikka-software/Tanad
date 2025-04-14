import { Quote, QuoteItem, QuoteCreateData, QuoteItemCreateData } from "@/types/quote.type";

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

export async function createQuote(quote: Omit<Quote, "id" | "created_at">): Promise<Quote> {
  const response = await fetch("/api/quotes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quote),
  });
  if (!response.ok) {
    throw new Error("Failed to create quote");
  }
  return response.json();
}

export async function updateQuote(
  id: string,
  quote: Partial<Omit<Quote, "id" | "created_at">>,
): Promise<Quote> {
  const response = await fetch(`/api/quotes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quote),
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
