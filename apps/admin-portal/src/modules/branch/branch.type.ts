import { Database } from "@/lib/database.types";

export type Branch = Database["public"]["Tables"]["branches"]["Row"];
export type BranchCreateData = Database["public"]["Tables"]["branches"]["Insert"];
export type BranchUpdateData = Database["public"]["Tables"]["branches"]["Update"];
