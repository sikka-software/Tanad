import { createGenericStore } from "@/utils/generic-store";

import { Office } from "./office.type";

const searchOfficeFn = (office: Office, searchQuery: string) =>
  office.name.toLowerCase().includes(searchQuery.toLowerCase());

const useOfficeStore = createGenericStore<Office>("offices", searchOfficeFn);

export default useOfficeStore;
