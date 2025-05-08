import { createGenericStore } from "@/utils/generic-store";

import { Domain } from "./domain.type";

const searchDomainFn = (domain: Domain, searchQuery: string) =>
  domain.domain_name.toLowerCase().includes(searchQuery.toLowerCase());

const useDomainStore = createGenericStore<Domain>("domains", searchDomainFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useDomainStore;
