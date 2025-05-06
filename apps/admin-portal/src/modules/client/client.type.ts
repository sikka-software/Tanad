import { Database } from "@/lib/database.types";

export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type ClientCreateData = Database["public"]["Tables"]["clients"]["Insert"];
export type ClientUpdateData = Database["public"]["Tables"]["clients"]["Update"];
