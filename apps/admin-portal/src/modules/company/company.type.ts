import { Database } from "@/lib/database.types";

export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type CompanyCreateData = Database["public"]["Tables"]["companies"]["Insert"];
export type CompanyUpdateData = Database["public"]["Tables"]["companies"]["Update"];
