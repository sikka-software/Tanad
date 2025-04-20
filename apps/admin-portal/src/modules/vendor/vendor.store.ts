import { createGenericStore } from "@/utils/generic-store";

import { Vendor } from "./vendor.type";

const searchVendorFn = (vendor: Vendor, searchQuery: string) =>
  vendor.name.toLowerCase().includes(searchQuery.toLowerCase());

const useVendorStore = createGenericStore<Vendor>("vendors", searchVendorFn);

export default useVendorStore;
