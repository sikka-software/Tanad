import { InferSelectModel, type InferInsertModel } from "drizzle-orm";

import { documents } from "@/db/schema";

export type Document = InferSelectModel<typeof documents>;
export type DocumentCreateData = InferInsertModel<typeof documents>;
export type DocumentUpdateData = InferInsertModel<typeof documents>;
