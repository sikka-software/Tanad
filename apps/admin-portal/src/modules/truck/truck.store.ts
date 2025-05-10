import { createGenericStore } from "@/utils/generic-store";

import { Truck } from "./truck.type";

const searchTruckFn = (truck: Truck, searchQuery: string) =>
  truck.name.toLowerCase().includes(searchQuery.toLowerCase());

const useTruckStore = createGenericStore<Truck>("trucks", searchTruckFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useTruckStore;
