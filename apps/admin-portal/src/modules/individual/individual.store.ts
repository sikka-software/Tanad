import { createGenericStore } from "@/utils/generic-store";

import { Individual } from "./individual.type";

const searchIndividualFn = (individual: Individual, searchQuery: string) =>
  individual.name.toLowerCase().includes(searchQuery.toLowerCase());

const useIndividualStore = createGenericStore<Individual>("individuals", searchIndividualFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useIndividualStore;
