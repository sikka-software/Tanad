import { Client } from "@/modules/client/client.type";

export type Invoice = {
  id: string;
  user_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: "paid" | "pending" | "overdue";
  subtotal: number;
  tax_rate?: number;
  total: number;
  notes?: string;
  client_id?: string;
  client?: Client;
  created_at: string;
};

export type InvoiceCreateData = Omit<Invoice, "id" | "created_at" | "client">;
