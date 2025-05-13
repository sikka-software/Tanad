import { Constants, Database } from "@/lib/database.types";

export const EmployeeStatus = Constants.public.Enums.employee_status;
export type EmployeeStatusProps = (typeof EmployeeStatus)[number];

export type Employee = Database["public"]["Tables"]["employees"]["Row"];
export type EmployeeCreateData = Database["public"]["Tables"]["employees"]["Insert"];
export type EmployeeUpdateData = Database["public"]["Tables"]["employees"]["Update"];
