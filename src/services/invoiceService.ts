import { db } from "@/db/drizzle";
import { Invoice } from "@/types/invoice.type";
import { eq, desc } from "drizzle-orm";
import { invoices, clients } from "@/db/schema";

export async function fetchInvoices() {
  return await db
    .select()
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .orderBy(desc(invoices.createdAt));
}

export async function fetchInvoiceById(id: string) {
  const [result] = await db
    .select()
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(eq(invoices.id, id))
    .limit(1);

  return result || null;
}

export async function createInvoice(newInvoice: InvoiceCreateData) {
  const [result] = await db.insert(invoices).values({
    ...newInvoice,
    issueDate: new Date(newInvoice.issueDate),
    dueDate: new Date(newInvoice.dueDate),
  }).returning();
  return result;
}

export async function updateInvoice(id: string, invoice: Partial<InvoiceCreateData>) {
  const updateData = {
    ...invoice,
    ...(invoice.issueDate && { issueDate: new Date(invoice.issueDate) }),
    ...(invoice.dueDate && { dueDate: new Date(invoice.dueDate) }),
  };
  
  const [result] = await db.update(invoices)
    .set(updateData)
    .where(eq(invoices.id, id))
    .returning();
  return result;
}

export async function deleteInvoice(id: string) {
  await db
    .delete(invoices)
    .where(eq(invoices.id, id));
}
