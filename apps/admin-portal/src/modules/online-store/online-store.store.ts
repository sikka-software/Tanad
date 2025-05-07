import { createGenericStore } from "@/utils/generic-store";

import { OnlineStore } from "./online-store.type";

const searchOnlineStoreFn = (onlineStore: OnlineStore, searchQuery: string) =>
  onlineStore.domain_name.toLowerCase().includes(searchQuery.toLowerCase());

const useOnlineStoreStore = createGenericStore<OnlineStore>("online-stores", searchOnlineStoreFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useOnlineStoreStore;
