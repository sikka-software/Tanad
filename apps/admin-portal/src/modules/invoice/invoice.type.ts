import { z } from "zod";

import { Client } from "@/client/client.type";

import { Product } from "../product/product.type";

export type Invoice = {
  id: string;
  user_id: string;
  invoice_number: string;
  issue_date: Date;
  due_date: Date;
  status: "paid" | "pending" | "overdue" | "draft" | "cancelled";
  subtotal: number;
  tax_rate?: number;
  total: number;
  notes?: string;
  client_id?: string;
  client?: Client;
  created_at: Date;
  items: InvoiceItem[];
};

export type InvoiceItem = {
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
};

export type InvoiceCreateData = Omit<Invoice, "id" | "created_at" | "total">;
