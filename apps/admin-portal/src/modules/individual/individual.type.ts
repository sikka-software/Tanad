import { InferSelectModel, type InferInsertModel } from "drizzle-orm";

import { individuals } from "@/db/schema";

export type Individual = InferSelectModel<typeof individuals>;
export type IndividualCreateData = InferInsertModel<typeof individuals>;
export type IndividualUpdateData = InferInsertModel<typeof individuals>;
