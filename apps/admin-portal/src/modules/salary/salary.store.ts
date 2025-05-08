import { createGenericStore } from "@/utils/generic-store";

import { Salary } from "./salary.type";

const searchSalaryFn = (salary: Salary, searchQuery: string) =>
  salary.amount.toString().toLowerCase().includes(searchQuery.toLowerCase());

const useSalaryStore = createGenericStore<Salary>("salaries", searchSalaryFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useSalaryStore;
