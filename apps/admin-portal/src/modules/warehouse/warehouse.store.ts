import { createGenericStore } from "@/utils/generic-store";

import { COLUMN_VISIBILITY } from "./warehouse.options";
import { Warehouse } from "./warehouse.type";

const searchWarehouseFn = (warehouse: Warehouse, searchQuery: string) =>
  warehouse.name.toLowerCase().includes(searchQuery.toLowerCase());

const useWarehouseStore = createGenericStore<Warehouse>("warehouses", searchWarehouseFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
  columnVisibility: COLUMN_VISIBILITY,
});

export default useWarehouseStore;
