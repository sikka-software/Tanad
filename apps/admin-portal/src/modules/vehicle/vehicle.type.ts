import { InferSelectModel, type InferInsertModel } from "drizzle-orm";

import { vehicles } from "@/db/schema";

export type Vehicle = InferSelectModel<typeof vehicles>;
export type VehicleCreateData = InferInsertModel<typeof vehicles>;
export type VehicleUpdateData = InferInsertModel<typeof vehicles>;
