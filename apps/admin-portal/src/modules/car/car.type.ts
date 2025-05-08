import { Database } from "@/lib/database.types";

export type Car = Database["public"]["Tables"]["cars"]["Row"];
export type CarCreateData = Database["public"]["Tables"]["cars"]["Insert"];
export type CarUpdateData = Database["public"]["Tables"]["cars"]["Update"];
