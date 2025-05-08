import { Database } from "@/lib/database.types";

export type Warehouse = Database["public"]["Tables"]["warehouses"]["Row"];
export type WarehouseCreateData = Database["public"]["Tables"]["warehouses"]["Insert"];
export type WarehouseUpdateData = Database["public"]["Tables"]["warehouses"]["Update"];
