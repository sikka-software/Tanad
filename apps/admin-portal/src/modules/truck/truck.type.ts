import { InferSelectModel, type InferInsertModel } from "drizzle-orm";

import { trucks } from "@/db/schema";

export type Truck = InferSelectModel<typeof trucks>;
export type TruckCreateData = InferInsertModel<typeof trucks>;
export type TruckUpdateData = InferInsertModel<typeof trucks>;
