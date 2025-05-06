import { createGenericStore } from "@/utils/generic-store";

import { Server } from "./server.type";

const searchServerFn = (server: Server, searchQuery: string) =>
  server.name.toLowerCase().includes(searchQuery.toLowerCase());

const useServerStore = createGenericStore<Server>("servers", searchServerFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useServerStore;
