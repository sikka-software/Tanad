import { createGenericStore } from "@/utils/generic-store";

import { COLUMN_VISIBILITY } from "./branch.options";
import { Branch } from "./branch.type";

const searchBranchFn = (branch: Branch, searchQuery: string) =>
  branch.name.toLowerCase().includes(searchQuery.toLowerCase());

const useBranchStore = createGenericStore<Branch>("branches", searchBranchFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
  columnVisibility: COLUMN_VISIBILITY,
});

export default useBranchStore;
