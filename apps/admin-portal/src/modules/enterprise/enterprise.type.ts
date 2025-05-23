import { InferSelectModel } from "drizzle-orm";

import { enterprises } from "@/db/schema";

export type Enterprise = InferSelectModel<typeof enterprises>;
