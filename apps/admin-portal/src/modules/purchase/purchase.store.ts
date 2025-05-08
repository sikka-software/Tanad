import { createGenericStore } from "@/utils/generic-store";

import { Purchase } from "./purchase.type";

const searchPurchaseFn = (purchase: Purchase, searchQuery: string) =>
  purchase.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  purchase.purchase_number?.toLowerCase().includes(searchQuery.toLowerCase());

const usePurchaseStore = createGenericStore<Purchase>("purchases", searchPurchaseFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default usePurchaseStore;
