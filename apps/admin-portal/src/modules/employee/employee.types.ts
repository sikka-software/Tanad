import { Database } from "@/lib/database.types";

export type Employee = Database["public"]["Tables"]["employees"]["Row"];
export type EmployeeCreateData = Database["public"]["Tables"]["employees"]["Insert"];
export type EmployeeUpdateData = Database["public"]["Tables"]["employees"]["Update"];
