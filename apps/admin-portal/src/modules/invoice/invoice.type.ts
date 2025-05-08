import type { Database } from "@/lib/database.types";

import type { Client } from "@/modules/client/client.type";

export type Invoice = Database["public"]["Tables"]["invoices"]["Row"] & {
  client: Client | null;
  items?: InvoiceItem[];
};

export type InvoiceItem = Database["public"]["Tables"]["invoice_items"]["Row"];

export type InvoiceItemInput = Database["public"]["Tables"]["invoice_items"]["Insert"];

export type InvoiceCreateData = Database["public"]["Tables"]["invoices"]["Insert"] & {
  items: InvoiceItemInput[];
};
export type InvoiceUpdateData = Database["public"]["Tables"]["invoices"]["Update"] & {
  items?: InvoiceItemInput[];
};
