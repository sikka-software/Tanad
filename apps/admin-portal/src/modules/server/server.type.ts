import { Database } from "@/lib/database.types";

export type Server = Database["public"]["Tables"]["servers"]["Row"];
export type ServerCreateData = Database["public"]["Tables"]["servers"]["Insert"];
export type ServerUpdateData = Database["public"]["Tables"]["servers"]["Update"];
