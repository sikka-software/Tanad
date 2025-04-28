import { createGenericStore } from "@/utils/generic-store";

import { Role } from "./role.type";

const searchRoleFn = (role: Role, searchQuery: string) =>
  role.name.toLowerCase().includes(searchQuery.toLowerCase());

const useRoleStore = createGenericStore<Role>("roles", searchRoleFn);

export default useRoleStore;
