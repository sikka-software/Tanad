import { createGenericStore } from "@/utils/generic-store";

import { Quote } from "./quote.type";

const searchQuoteFn = (quote: Quote, searchQuery: string) =>
  quote.quote_number.toLowerCase().includes(searchQuery.toLowerCase());

const useQuoteStore = createGenericStore<Quote>("quotes", searchQuoteFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useQuoteStore;
