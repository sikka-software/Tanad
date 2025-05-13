import { Constants, Database } from "@/lib/database.types";

export const EmployeeRequestStatus = Constants.public.Enums.employee_request_status;
export type EmployeeRequestStatusProps = (typeof EmployeeRequestStatus)[number];

export type EmployeeRequest = Database["public"]["Tables"]["employee_requests"]["Row"];
export type EmployeeRequestCreateData = Database["public"]["Tables"]["employee_requests"]["Insert"];
export type EmployeeRequestUpdateData = Database["public"]["Tables"]["employee_requests"]["Update"];
