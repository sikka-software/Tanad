import { createGenericStore } from "@/utils/generic-store";

import { EmployeeRequest } from "./employee-request.type";

const searchEmployeeRequestFn = (employeeRequest: EmployeeRequest, searchQuery: string) =>
  employeeRequest.title.toLowerCase().includes(searchQuery.toLowerCase());

const useEmployeeRequestStore = createGenericStore<EmployeeRequest>(
  "employee_requests",
  searchEmployeeRequestFn,
);

export default useEmployeeRequestStore;
