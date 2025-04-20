import { createApiHandler } from "@/lib/api-handler";

import { db } from "@/db/drizzle";
import { jobs } from "@/db/schema";

export default createApiHandler({
  table: jobs,
  query: db.query.jobs,
});
