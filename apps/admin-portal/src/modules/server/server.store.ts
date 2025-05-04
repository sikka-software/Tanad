import { createGenericStore } from "@/utils/generic-store";

import { Branch } from "./branch.type";

const searchBranchFn = (branch: Branch, searchQuery: string) =>
  branch.name.toLowerCase().includes(searchQuery.toLowerCase());

const useBranchStore = createGenericStore<Branch>("branches", searchBranchFn);

export default useBranchStore;
