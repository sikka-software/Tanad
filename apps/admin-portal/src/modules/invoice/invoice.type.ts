import { Client } from "@/modules/client/client.type";

export type Invoice = {
  id: string;
  user_id: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: "paid" | "pending" | "overdue";
  subtotal: number;
  taxRate?: number;
  total: number;
  notes?: string;
  client_id?: string;
  client?: Client;
  created_at: Date;
};

export type InvoiceCreateData = Omit<Invoice, "id" | "created_at" | "client">;
