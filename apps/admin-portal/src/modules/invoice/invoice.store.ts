import { createGenericStore } from "@/utils/generic-store";

import { Invoice } from "./invoice.type";

const searchInvoiceFn = (invoice: Invoice, searchQuery: string) =>
  invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());

const useInvoiceStore = createGenericStore<Invoice>("invoices", searchInvoiceFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useInvoiceStore;
