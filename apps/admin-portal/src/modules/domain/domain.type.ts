import { Database } from "@/lib/database.types";

export type Domain = Database["public"]["Tables"]["domains"]["Row"];
export type DomainCreateData = Database["public"]["Tables"]["domains"]["Insert"];
export type DomainUpdateData = Database["public"]["Tables"]["domains"]["Update"];
