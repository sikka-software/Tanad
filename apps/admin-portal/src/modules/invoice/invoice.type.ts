import type { Database } from "@/lib/database.types";
import { Constants } from "@/lib/database.types";

import type { Client } from "@/client/client.type";

export const InvoiceStatus = Constants.public.Enums.invoice_status;
export type InvoiceStatusProps = (typeof InvoiceStatus)[number];

// ZATCA compliance type
export interface ZatcaCompliance {
  isCompliant: boolean;
  sellerName: string;
  vatNumber: string;
  qrCode?: string;
}

export type Invoice = Database["public"]["Tables"]["invoices"]["Row"] & {
  client: Client | null;
  items?: InvoiceItem[];
  zatca_compliance?: ZatcaCompliance;
  seller_name?: string;
  vat_number?: string;
  tax_amount?: number;
};

export type InvoiceItem = Database["public"]["Tables"]["invoice_items"]["Row"];

export type InvoiceItemInput = Database["public"]["Tables"]["invoice_items"]["Insert"];

// Represents an item's fields that are managed by the form/client,
// excluding DB-generated fields like invoice_id, id, created_at, amount for new items.
export type InvoiceItemClientData = Omit<
  Database["public"]["Tables"]["invoice_items"]["Insert"],
  "invoice_id" | "id" | "created_at" | "amount"
>;

export type InvoiceCreateData = Omit<
  Database["public"]["Tables"]["invoices"]["Insert"],
  "notes"
> & {
  items: InvoiceItemClientData[];
  notes?: string | null; // Align notes with form usage (string) instead of Json
  seller_name?: string; // ZATCA: Seller name
  vat_number?: string; // ZATCA: VAT registration number
  zatca_enabled?: boolean; // Whether to enable ZATCA compliance for this invoice
};

export type InvoiceUpdateData = Omit<
  Database["public"]["Tables"]["invoices"]["Update"],
  "notes"
> & {
  id: string; // Explicitly require id for update payloads
  items?: (InvoiceItemClientData & { id?: string })[]; // For items in an update, they might have an ID (if existing) or not (if new)
  seller_name?: string; // ZATCA: Seller name
  vat_number?: string; // ZATCA: VAT registration number
  zatca_enabled?: boolean; // Whether to enable ZATCA compliance for this invoice
};
