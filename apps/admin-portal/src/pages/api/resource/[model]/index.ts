import { NextApiRequest, NextApiResponse } from "next";

import { createApiHandler } from "@/lib/api-handler";

import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";

const modelMap = {
  branches: { table: schema.branches, query: db.query.branches },
  companies: { table: schema.companies, query: db.query.companies },
  jobs: { table: schema.jobs, query: db.query.jobs },
  clients: { table: schema.clients, query: db.query.clients },
  expenses: { table: schema.expenses, query: db.query.expenses },
  departments: { table: schema.departments, query: db.query.departments },
  offices: { table: schema.offices, query: db.query.offices },
  warehouses: { table: schema.warehouses, query: db.query.warehouses },
  employees: { table: schema.employees, query: db.query.employees },
  products: { table: schema.products, query: db.query.products },
  invoices: { table: schema.invoices, query: db.query.invoices },
  quotes: { table: schema.quotes, query: db.query.quotes },
  vendors: { table: schema.vendors, query: db.query.vendors },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { model } = req.query;

  if (typeof model !== "string" || !(model in modelMap)) {
    return res.status(404).json({ message: "Not found" });
  }

  const { table, query } = modelMap[model as keyof typeof modelMap];

  return createApiHandler({ table, query })(req, res);
}
