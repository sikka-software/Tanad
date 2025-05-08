import { createGenericStore } from "@/utils/generic-store";

import { Product } from "./product.type";

const searchProductFn = (product: Product, searchQuery: string) =>
  product.name.toLowerCase().includes(searchQuery.toLowerCase());

const useProductStore = createGenericStore<Product>("products", searchProductFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useProductStore;
