import { createGenericStore } from "@/utils/generic-store";

import { Department } from "./department.type";

const searchDepartmentFn = (department: Department, searchQuery: string) =>
  department.name.toLowerCase().includes(searchQuery.toLowerCase());

const useDepartmentStore = createGenericStore<Department>("departments", searchDepartmentFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useDepartmentStore;
