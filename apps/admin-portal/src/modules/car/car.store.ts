import { createGenericStore } from "@/utils/generic-store";

import { Car } from "./car.type";

const searchCarFn = (car: Car, searchQuery: string) =>
  car.name.toLowerCase().includes(searchQuery.toLowerCase());

const useCarStore = createGenericStore<Car>("cars", searchCarFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useCarStore;
