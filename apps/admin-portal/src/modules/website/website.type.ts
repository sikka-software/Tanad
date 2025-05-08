import { Database } from "@/lib/database.types";

export type Website = Database["public"]["Tables"]["websites"]["Row"];
export type WebsiteCreateData = Database["public"]["Tables"]["websites"]["Insert"];
export type WebsiteUpdateData = Database["public"]["Tables"]["websites"]["Update"];
