import { createGenericStore } from "@/utils/generic-store";

import { Client } from "./client.type";

const searchClientFn = (client: Client, searchQuery: string) =>
  client.name.toLowerCase().includes(searchQuery.toLowerCase());

const useClientStore = createGenericStore<Client>("clients", searchClientFn);

export default useClientStore;
