import { createGenericStore } from "@/utils/generic-store";

import { UserType } from "./user.type";

const searchUserFn = (user: UserType, searchQuery: string) =>
  user.email ? user.email.toLowerCase().includes(searchQuery.toLowerCase()) : false;

const useUsersStore = createGenericStore<UserType>("users", searchUserFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useUsersStore;
