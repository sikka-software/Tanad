import { Database } from "@/lib/database.types";

export type Office = Database["public"]["Tables"]["offices"]["Row"];
export type OfficeCreateData = Database["public"]["Tables"]["offices"]["Insert"];
export type OfficeUpdateData = Database["public"]["Tables"]["offices"]["Update"];
