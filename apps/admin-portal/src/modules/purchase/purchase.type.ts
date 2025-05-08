import { Database } from "@/lib/database.types";

export type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
export type PurchaseCreateData = Database["public"]["Tables"]["purchases"]["Insert"];
export type PurchaseUpdateData = Database["public"]["Tables"]["purchases"]["Update"];
