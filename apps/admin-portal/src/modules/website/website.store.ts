import { createGenericStore } from "@/utils/generic-store";

import { Website } from "./website.type";

const searchWebsiteFn = (website: Website, searchQuery: string) =>
  website.domain_name?.toLowerCase().includes(searchQuery.toLowerCase());

const useWebsiteStore = createGenericStore<Website>("websites", searchWebsiteFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useWebsiteStore;
