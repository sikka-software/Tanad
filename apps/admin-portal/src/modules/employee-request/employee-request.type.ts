import { Database } from "@/lib/database.types";

export type EmployeeRequest = Database["public"]["Tables"]["employee_requests"]["Row"];
export type EmployeeRequestCreateData = Database["public"]["Tables"]["employee_requests"]["Insert"];
export type EmployeeRequestUpdateData = Database["public"]["Tables"]["employee_requests"]["Update"];
