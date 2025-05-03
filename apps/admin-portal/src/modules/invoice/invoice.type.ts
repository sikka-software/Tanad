import type { Database } from "@/lib/database.types";

export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

export type InvoiceItem = Database["public"]["Tables"]["invoice_items"]["Row"];

export type InvoiceCreateData = Omit<Invoice, "id" | "created_at" | "total">;
export type InvoiceUpdateData = Partial<Invoice>;
export type InvoiceItemCreateData = Omit<InvoiceItem, "id">;
