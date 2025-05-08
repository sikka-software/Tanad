import { createGenericStore } from "@/utils/generic-store";

import { Office } from "./office.type";

const searchOfficeFn = (office: Office, searchQuery: string) =>
  office.name.toLowerCase().includes(searchQuery.toLowerCase());

const useOfficeStore = createGenericStore<Office>("offices", searchOfficeFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useOfficeStore;
