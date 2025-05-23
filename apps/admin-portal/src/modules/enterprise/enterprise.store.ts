import { createGenericStore } from "@/utils/generic-store";

import { Enterprise } from "./enterprise.type";

const searchEnterpriseFn = (enterprise: Enterprise, searchQuery: string) =>
  enterprise.name.toLowerCase().includes(searchQuery.toLowerCase());

const useEnterpriseStore = createGenericStore<Enterprise>("enterprises", searchEnterpriseFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useEnterpriseStore;
