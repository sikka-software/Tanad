import { InferSelectModel, type InferInsertModel } from "drizzle-orm";

import { vendors } from "@/db/schema";

export type Vendor = InferSelectModel<typeof vendors>;
export type VendorCreateData = InferInsertModel<typeof vendors>;
export type VendorUpdateData = InferInsertModel<typeof vendors>;
