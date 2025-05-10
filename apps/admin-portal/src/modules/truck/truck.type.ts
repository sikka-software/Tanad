import { Database } from "@/lib/database.types";

export type Truck = Database["public"]["Tables"]["trucks"]["Row"];
export type TruckCreateData = Database["public"]["Tables"]["trucks"]["Insert"];
export type TruckUpdateData = Database["public"]["Tables"]["trucks"]["Update"];
