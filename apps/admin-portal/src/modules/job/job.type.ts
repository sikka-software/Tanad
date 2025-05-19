import { InferSelectModel, type InferInsertModel } from "drizzle-orm";

import { jobs } from "@/db/schema";

export type Job = InferSelectModel<typeof jobs>;
export type JobCreateData = InferInsertModel<typeof jobs>;
export type JobUpdateData = InferInsertModel<typeof jobs>;
