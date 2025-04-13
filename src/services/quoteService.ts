import { Quote, QuoteItem, QuoteCreateData, QuoteItemCreateData } from "@/types/quote.type";

export async function fetchQuotes(): Promise<Quote[]> {
  const response = await fetch("/api/quotes");
  if (!response.ok) {
    throw new Error("Failed to fetch quotes");
  }
  return response.json();
}

export async function fetchQuoteById(id: string): Promise<Quote> {
  try {
    const response = await fetch(`/api/quotes/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Quote with id ${id} not found`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching quote ${id}:`, error);
    throw new Error(`Failed to fetch quote with id ${id}`);
  }
}

export async function createQuote(quote: QuoteCreateData) {
  try {
    // Map quote data to match Drizzle schema
    const dbQuote = {
      quoteNumber: quote.quote_number,
      issueDate: quote.issue_date,
      expiryDate: quote.expiry_date,
      subtotal: quote.subtotal.toString(),
      taxRate: quote.tax_rate.toString(),
      taxAmount: quote.tax_amount.toString(),
      total: quote.total.toString(),
      status: quote.status,
      notes: quote.notes || null,
      clientId: quote.client_id,
      userId: quote.userId || "",
    };

    const response = await fetch("/api/quotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dbQuote),
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

export async function updateQuote(id: string, quote: Partial<Quote>) {
  try {
    // Map quote data to match Drizzle schema
    const dbQuote = {
      ...(quote.quote_number && { quoteNumber: quote.quote_number }),
      ...(quote.issue_date && { issueDate: quote.issue_date }),
      ...(quote.expiry_date && { expiryDate: quote.expiry_date }),
      ...(quote.subtotal && { subtotal: quote.subtotal.toString() }),
      ...(quote.tax_rate && { taxRate: quote.tax_rate.toString() }),
      ...(quote.tax_amount && { taxAmount: quote.tax_amount.toString() }),
      ...(quote.total && { total: quote.total.toString() }),
      ...(quote.status && { status: quote.status }),
      ...(quote.notes !== undefined && { notes: quote.notes }),
      ...(quote.client_id && { clientId: quote.client_id }),
    };

    const response = await fetch(`/api/quotes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dbQuote),
    });

    if (!response.ok) {
      throw new Error(`Failed to update quote with id ${id}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error updating quote ${id}:`, error);
    throw new Error(`Failed to update quote with id ${id}`);
  }
}

export async function deleteQuote(id: string) {
  try {
    const response = await fetch(`/api/quotes/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete quote with id ${id}`);
    }
  } catch (error) {
    console.error(`Error deleting quote ${id}:`, error);
    throw new Error(`Failed to delete quote with id ${id}`);
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
