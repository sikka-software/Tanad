import { createGenericStore } from "@/utils/generic-store";

import { User } from "./user.type";

const searchUserFn = (user: User, searchQuery: string) =>
  user.email ? user.email.toLowerCase().includes(searchQuery.toLowerCase()) : false;

const useUserStore = createGenericStore<User>("users", searchUserFn);

export default useUserStore;
