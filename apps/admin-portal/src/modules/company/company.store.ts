import { createGenericStore } from "@/utils/generic-store";

import { Company } from "./company.type";

const searchCompanyFn = (company: Company, searchQuery: string) =>
  company.name.toLowerCase().includes(searchQuery.toLowerCase());

const useCompanyStore = createGenericStore<Company>("companies", searchCompanyFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useCompanyStore;
