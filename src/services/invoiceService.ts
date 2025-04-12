import { desc, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { invoices, clients } from "@/db/schema";
import { Invoice } from "@/types/invoice.type";

// Helper to convert Drizzle invoice to our Invoice type
function convertDrizzleInvoice(
  data: typeof invoices.$inferSelect & { clients?: typeof clients.$inferSelect | null },
): Invoice {
  if (!data.createdAt) {
    throw new Error("Invoice must have a creation date");
  }

  return {
    id: data.id,
    userId: data.userId,
    invoiceNumber: data.invoiceNumber,
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    status: data.status,
    subtotal: Number(data.subtotal),
    taxRate: data.taxRate ? Number(data.taxRate) : undefined,
    total: Number(data.total),
    notes: data.notes || undefined,
    clientId: data.clientId || undefined,
    createdAt: data.createdAt,
    client: data.clients
      ? {
          id: data.clients.id,
          name: data.clients.name,
          company: data.clients.company || "No Company",
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

export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const data = await db.query.invoices.findMany({
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
      orderBy: desc(invoices.createdAt),
    });
    return data.map(convertDrizzleInvoice);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
}

export async function fetchInvoiceById(id: string): Promise<Invoice> {
  const data = await db.query.invoices.findFirst({
    where: eq(invoices.id, id),
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
    throw new Error(`Invoice with id ${id} not found`);
  }

  return convertDrizzleInvoice(data);
}

export async function createInvoice(invoice: Omit<Invoice, "id" | "createdAt">) {
  // Map invoice data to match Drizzle schema
  const dbInvoice = {
    userId: invoice.userId,
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: invoice.status,
    subtotal: invoice.subtotal.toString(),
    taxRate: invoice.taxRate?.toString() || null,
    total: invoice.total.toString(),
    notes: invoice.notes || null,
    clientId: invoice.clientId || null,
  };

  const [data] = await db.insert(invoices).values(dbInvoice).returning();

  if (!data) {
    throw new Error("Failed to create invoice");
  }

  return convertDrizzleInvoice(data);
}

export async function updateInvoice(id: string, invoice: Partial<Invoice>) {
  // Map invoice data to match Drizzle schema
  const dbInvoice = {
    ...(invoice.userId && { userId: invoice.userId }),
    ...(invoice.invoiceNumber && { invoiceNumber: invoice.invoiceNumber }),
    ...(invoice.issueDate && { issueDate: invoice.issueDate }),
    ...(invoice.dueDate && { dueDate: invoice.dueDate }),
    ...(invoice.status && { status: invoice.status }),
    ...(invoice.subtotal && { subtotal: invoice.subtotal.toString() }),
    ...(invoice.taxRate && { taxRate: invoice.taxRate.toString() }),
    ...(invoice.total && { total: invoice.total.toString() }),
    ...(invoice.notes !== undefined && { notes: invoice.notes }),
    ...(invoice.clientId !== undefined && { clientId: invoice.clientId }),
  };

  const [data] = await db.update(invoices).set(dbInvoice).where(eq(invoices.id, id)).returning();

  if (!data) {
    throw new Error(`Failed to update invoice with id ${id}`);
  }

  return convertDrizzleInvoice(data);
}

export async function deleteInvoice(id: string) {
  await db.delete(invoices).where(eq(invoices.id, id));
}
