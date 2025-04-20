import { Client } from "@/modules/client/client.type";

export type Invoice = {
  id: string;
  user_id: string;
  invoice_number: string;
  issue_date: Date;
  due_date: Date;
  status: "paid" | "pending" | "overdue";
  subtotal: number;
  tax_rate?: number;
  total: number;
  notes?: string;
  client_id?: string;
  client?: Client;
  created_at: Date;
};

export type InvoiceCreateData = Omit<Invoice, "id" | "created_at" | "client">;
