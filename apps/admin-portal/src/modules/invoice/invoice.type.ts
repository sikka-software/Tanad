import type { Database } from "@/lib/database.types";

import type { Client } from "@/modules/client/client.type";

export type Invoice = Database["public"]["Tables"]["invoices"]["Row"] & {
  client: Client | null; // Assuming 'Client' type exists and client can be null
  items?: InvoiceItem[]; // Assuming items might be included sometimes
};

export type InvoiceItem = Database["public"]["Tables"]["invoice_items"]["Row"];

// Base types from DB
// Exclude fields automatically handled by the API or DB
type BaseInvoiceCreate = Omit<
  Invoice,
  "id" | "created_at" | "total" | "created_by" | "enterprise_id" | "tax_amount" | "client" | "items"
>;
type BaseInvoiceUpdate = Partial<Omit<Invoice, "items">>; // Omit items here

// Extended types expected by the form/API handlers
// Explicitly define the fields needed for creating an invoice item via the form/API
export type InvoiceItemInput = {
  product_id?: string | null; // Match backend expectation (null if not provided)
  description: string;
  quantity: number;
  unit_price: number;
};

export type InvoiceCreateData = Database["public"]["Tables"]["invoices"]["Insert"] & {
  items: InvoiceItemInput[];
};
export type InvoiceUpdateData = Database["public"]["Tables"]["invoices"]["Update"] & {
  items?: InvoiceItemInput[];
};

export type InvoiceItemCreateData = Omit<InvoiceItem, "id">;
