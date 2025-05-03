import type { Database } from "@/lib/database.types";
import type { Client } from "@/modules/client/client.type";

export type Invoice = Database["public"]["Tables"]["invoices"]["Row"] & {
  client: Client | null; // Assuming 'Client' type exists and client can be null
  items?: InvoiceItem[]; // Assuming items might be included sometimes
};

export type InvoiceItem = Database["public"]["Tables"]["invoice_items"]["Row"];

// Base types from DB
// Exclude fields automatically handled by the API or DB
type BaseInvoiceCreate = Omit<Invoice, "id" | "created_at" | "total" | "created_by" | "enterprise_id" | "tax_amount">;
type BaseInvoiceUpdate = Partial<Invoice>;

// Extended types expected by the form/API handlers
// Explicitly define the fields needed for creating an invoice item via the form/API
export type InvoiceItemInput = {
  product_id?: string | null; // Match backend expectation (null if not provided)
  description: string;
  quantity: number;
  unit_price: number;
};
export type InvoiceCreateData = BaseInvoiceCreate & { items: InvoiceItemInput[] };
export type InvoiceUpdateData = BaseInvoiceUpdate & { items?: InvoiceItemInput[] }; // Items optional for update

export type InvoiceItemCreateData = Omit<InvoiceItem, "id">;

