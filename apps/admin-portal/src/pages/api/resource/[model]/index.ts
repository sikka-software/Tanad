import { NextApiRequest, NextApiResponse } from "next";

import { createApiHandler } from "@/lib/api-handler";

import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";

const modelMap = {
  branches: { table: schema.branches, query: db.query.branches },
  companies: { table: schema.companies, query: db.query.companies },
  jobs: { table: schema.jobs, query: db.query.jobs },
  clients: { table: schema.clients, query: db.query.clients },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { model } = req.query;

  if (typeof model !== "string" || !(model in modelMap)) {
    return res.status(404).json({ message: "Not found" });
  }

  const { table, query } = modelMap[model as keyof typeof modelMap];

  return createApiHandler({ table, query })(req, res);
}
