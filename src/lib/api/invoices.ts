import { Invoice } from "@/types/invoice.type";

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  try {
    const response = await fetch(`/api/invoices/${id}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    return null;
  }
} 