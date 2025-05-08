import { Database } from "@/lib/database.types";

export type OnlineStore = Database["public"]["Tables"]["online_stores"]["Row"];
export type OnlineStoreCreateData = Database["public"]["Tables"]["online_stores"]["Insert"];
export type OnlineStoreUpdateData = Database["public"]["Tables"]["online_stores"]["Update"];
