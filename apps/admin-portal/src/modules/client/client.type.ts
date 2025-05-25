import { InferSelectModel, type InferInsertModel } from "drizzle-orm";

import { clients } from "@/db/schema";

export type Client = InferSelectModel<typeof clients>;
export type ClientCreateData = InferInsertModel<typeof clients>;
export type ClientUpdateData = InferInsertModel<typeof clients>;
