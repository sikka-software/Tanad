import { createGenericStore } from "@/utils/generic-store";

import { Employee } from "./employee.types";

const searchEmployeeFn = (employee: Employee, searchQuery: string) =>
  employee.first_name.toLowerCase().includes(searchQuery.toLowerCase());

const useEmployeeStore = createGenericStore<Employee>("employees", searchEmployeeFn);

export default useEmployeeStore;
