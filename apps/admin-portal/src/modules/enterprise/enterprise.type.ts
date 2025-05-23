import { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { enterprises } from "@/db/schema";

export type Enterprise = InferSelectModel<typeof enterprises>;
export type EnterpriseCreateData = InferInsertModel<typeof enterprises>;
export type EnterpriseUpdateData = InferInsertModel<typeof enterprises>;
