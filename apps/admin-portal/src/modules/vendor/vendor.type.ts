import { Database } from "@/lib/database.types";

export type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
export type VendorCreateData = Database["public"]["Tables"]["vendors"]["Insert"];
export type VendorUpdateData = Database["public"]["Tables"]["vendors"]["Update"];
