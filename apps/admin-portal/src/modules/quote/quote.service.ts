import {
  Quote,
  QuoteCreateData,
  QuoteItemCreateServiceData,
  QuoteUpdateData,
  QuoteItemUpdateServiceData,
} from "@/quote/quote.type";

export async function fetchQuotes(): Promise<Quote[]> {
  try {
    const response = await fetch("/api/resource/quotes");
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
    const response = await fetch(`/api/resource/quotes/${id}`);
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
    const response = await fetch("/api/resource/quotes", {
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

export async function duplicateQuote(id: string): Promise<Quote> {
  try {
    const response = await fetch(`/api/resource/quotes/${id}/duplicate`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to duplicate quote");
    }
    return response.json();
  } catch (error) {
    console.error("Error duplicating quote:", error);
    throw new Error("Failed to duplicate quote");
  }
}
export async function updateQuote(id: string, updates: QuoteUpdateData): Promise<Quote> {
  try {
    const response = await fetch(`/api/resource/quotes/${id}`, {
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

// Quote Items API endpoints
export async function createQuoteItem(quoteItem: QuoteItemCreateServiceData) {
  try {
    const dbQuoteItem = {
      quote_id: quoteItem.quote_id,
      description: quoteItem.description,
      quantity: quoteItem.quantity.toString(),
      unit_price: quoteItem.unit_price.toString(),
      ...(quoteItem.product_id && { product_id: quoteItem.product_id }),
    };

    const response = await fetch("/api/resource/quote-items", {
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

export async function updateQuoteItem(id: string, quoteItem: QuoteItemUpdateServiceData) {
  try {
    const dbQuoteItem = {
      ...(quoteItem.quote_id && { quote_id: quoteItem.quote_id }),
      ...(quoteItem.description && { description: quoteItem.description }),
      ...(quoteItem.quantity !== undefined && { quantity: quoteItem.quantity.toString() }),
      ...(quoteItem.unit_price !== undefined && { unit_price: quoteItem.unit_price.toString() }),
      ...(quoteItem.product_id && { product_id: quoteItem.product_id }),
    };

    const response = await fetch(`/api/resource/quote-items/${id}`, {
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
    const response = await fetch(`/api/resource/quote-items/${id}`, {
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
