import { Database } from "@/lib/database.types";

export type Salary = Database["public"]["Tables"]["salaries"]["Row"];
export type SalaryCreateData = Database["public"]["Tables"]["salaries"]["Insert"];
export type SalaryUpdateData = Database["public"]["Tables"]["salaries"]["Update"];
