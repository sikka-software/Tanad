import { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { branches } from "@/db/schema";

export type Branch = InferSelectModel<typeof branches>;
export type BranchCreateData = InferInsertModel<typeof branches>;
export type BranchUpdateData = InferInsertModel<typeof branches>;
