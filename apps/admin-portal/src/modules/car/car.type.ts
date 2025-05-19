import { InferSelectModel, type InferInsertModel } from "drizzle-orm";

import { cars } from "@/db/schema";

export type Car = InferSelectModel<typeof cars>;
export type CarCreateData = InferInsertModel<typeof cars>;
export type CarUpdateData = InferInsertModel<typeof cars>;
