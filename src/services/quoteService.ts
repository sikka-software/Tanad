import { desc, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { quotes, quoteItems, clients } from "@/db/schema";
import { Quote, QuoteItem, QuoteCreateData, QuoteItemCreateData } from "@/types/quote.type";

// Helper to convert Drizzle quote to our Quote type
function convertDrizzleQuote(
  data: typeof quotes.$inferSelect & { clients?: typeof clients.$inferSelect | null },
): Quote {
  if (!data.createdAt) {
    throw new Error("Quote must have a creation date");
  }

  return {
    id: data.id,
    created_at: data.createdAt.toString(),
    quote_number: data.quoteNumber,
    issue_date: data.issueDate,
    expiry_date: data.expiryDate,
    subtotal: Number(data.subtotal),
    tax_rate: Number(data.taxRate),
    tax_amount: Number(data.taxAmount),
    total: Number(data.total),
    status: data.status,
    notes: data.notes || undefined,
    client_id: data.clientId,
    clients: data.clients
      ? {
          id: data.clients.id,
          name: data.clients.name,
          company: data.clients.company || "No Company", // Default value since it's required
          email: data.clients.email || "",
          phone: data.clients.phone,
          address: data.clients.address,
          city: data.clients.city,
          state: data.clients.state,
          zip_code: data.clients.zipCode,
          notes: data.clients.notes || null,
          created_at: data.clients.createdAt?.toString() || "",
        }
      : undefined,
  };
}

// Helper to convert Drizzle quote item to our QuoteItem type
function convertDrizzleQuoteItem(data: typeof quoteItems.$inferSelect): QuoteItem {
  return {
    id: data.id,
    quote_id: data.quoteId,
    product_id: undefined, // Quote items don't have product_id in schema
    description: data.description,
    quantity: Number(data.quantity),
    unit_price: Number(data.unitPrice),
  };
}

export async function fetchQuotes(): Promise<Quote[]> {
  try {
    const data = await db.query.quotes.findMany({
      with: {
        clients: {
          columns: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            notes: true,
            createdAt: true,
          },
        },
      },
      orderBy: desc(quotes.createdAt),
    });
    return data.map(convertDrizzleQuote);
  } catch (error) {
    console.error("Error fetching quotes:", error);
    throw error;
  }
}

export async function fetchQuoteById(id: string): Promise<Quote> {
  const data = await db.query.quotes.findFirst({
    where: eq(quotes.id, id),
    with: {
      clients: {
        columns: {
          id: true,
          name: true,
          company: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          notes: true,
          createdAt: true,
        },
      },
    },
  });

  if (!data) {
    throw new Error(`Quote with id ${id} not found`);
  }

  return convertDrizzleQuote(data);
}

export async function createQuote(quote: QuoteCreateData) {
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

  const [data] = await db.insert(quotes).values(dbQuote).returning();

  if (!data) {
    throw new Error("Failed to create quote");
  }

  return convertDrizzleQuote(data);
}

export async function updateQuote(id: string, quote: Partial<Quote>) {
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

  const [data] = await db.update(quotes).set(dbQuote).where(eq(quotes.id, id)).returning();

  if (!data) {
    throw new Error(`Failed to update quote with id ${id}`);
  }

  return convertDrizzleQuote(data);
}

export async function deleteQuote(id: string) {
  await db.delete(quotes).where(eq(quotes.id, id));
}

export async function createQuoteItem(quoteItem: QuoteItemCreateData) {
  // Map quote item data to match Drizzle schema
  const dbQuoteItem = {
    quoteId: quoteItem.quote_id,
    description: quoteItem.description,
    quantity: quoteItem.quantity.toString(),
    unitPrice: quoteItem.unit_price.toString(),
  };

  const [data] = await db.insert(quoteItems).values(dbQuoteItem).returning();

  if (!data) {
    throw new Error("Failed to create quote item");
  }

  return convertDrizzleQuoteItem(data);
}

export async function updateQuoteItem(id: string, quoteItem: Partial<QuoteItem>) {
  // Map quote item data to match Drizzle schema
  const dbQuoteItem = {
    ...(quoteItem.quote_id && { quoteId: quoteItem.quote_id }),
    ...(quoteItem.description && { description: quoteItem.description }),
    ...(quoteItem.quantity && { quantity: quoteItem.quantity.toString() }),
    ...(quoteItem.unit_price && { unitPrice: quoteItem.unit_price.toString() }),
  };

  const [data] = await db
    .update(quoteItems)
    .set(dbQuoteItem)
    .where(eq(quoteItems.id, id))
    .returning();

  if (!data) {
    throw new Error(`Failed to update quote item with id ${id}`);
  }

  return convertDrizzleQuoteItem(data);
}

export async function deleteQuoteItem(id: string) {
  await db.delete(quoteItems).where(eq(quoteItems.id, id));
  return true;
}
