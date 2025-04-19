import { Invoice } from "@/modules/invoice/invoice.type";

export async function fetchInvoices(): Promise<Invoice[]> {
  const response = await fetch("/api/invoices");
  if (!response.ok) {
    throw new Error("Failed to fetch invoices");
  }
  return response.json();
}

export async function fetchInvoiceById(id: string): Promise<Invoice> {
  const response = await fetch(`/api/invoices/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch invoice");
  }
  return response.json();
}

export async function createInvoice(invoice: Omit<Invoice, "id" | "created_at">): Promise<Invoice> {
  const response = await fetch("/api/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(invoice),
  });
  if (!response.ok) {
    throw new Error("Failed to create invoice");
  }
  return response.json();
}

export async function updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
  const response = await fetch(`/api/invoices/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(invoice),
  });
  if (!response.ok) {
    throw new Error("Failed to update invoice");
  }
  return response.json();
}

export async function deleteInvoice(id: string): Promise<void> {
  const response = await fetch(`/api/invoices/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete invoice");
  }
}

export async function bulkDeleteInvoices(ids: string[]): Promise<void> {
  try {
    const response = await fetch("/api/invoices/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
      throw new Error("Failed to delete invoices");
    }
  } catch (error) {
    console.error("Error deleting invoices:", error);
    throw new Error("Failed to delete invoices");
  }
}
