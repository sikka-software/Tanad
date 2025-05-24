import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/server-props";

import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";

type ModelConfig = {
  table: any;
  query: {
    findFirst: (config: { where: any }) => Promise<any>;
  };
  idField: string;
  excludeFromDuplicate?: string[]; // New property to specify excluded fields
};

const modelMap: Record<string, ModelConfig> = {
  branches: {
    table: schema.branches,
    query: db.query.branches,
    idField: "id",
    excludeFromDuplicate: ["code"],
  },
  companies: {
    table: schema.companies,
    query: db.query.companies,
    idField: "id",
    excludeFromDuplicate: ["user_id"],
  },
  jobs: { table: schema.jobs, query: db.query.jobs, idField: "id" },
  clients: { table: schema.clients, query: db.query.clients, idField: "id" },
  expenses: { table: schema.expenses, query: db.query.expenses, idField: "id" },
  departments: { table: schema.departments, query: db.query.departments, idField: "id" },
  department_locations: {
    table: schema.department_locations,
    query: db.query.department_locations,
    idField: "id",
    excludeFromDuplicate: ["department_id"],
  },
  online_stores: {
    table: schema.online_stores,
    query: db.query.online_stores,
    idField: "id",
  },
  salaries: { table: schema.salaries, query: db.query.salaries, idField: "id" },
  offices: { table: schema.offices, query: db.query.offices, idField: "id" },
  warehouses: {
    table: schema.warehouses,
    query: db.query.warehouses,
    idField: "id",
    excludeFromDuplicate: ["code"],
  },
  employees: { table: schema.employees, query: db.query.employees, idField: "id" },
  products: { table: schema.products, query: db.query.products, idField: "id" },
  invoices: { table: schema.invoices, query: db.query.invoices, idField: "id" },
  quotes: { table: schema.quotes, query: db.query.quotes, idField: "id" },
  vendors: { table: schema.vendors, query: db.query.vendors, idField: "id" },
  trucks: { table: schema.trucks, query: db.query.trucks, idField: "id" },
  cars: { table: schema.cars, query: db.query.cars, idField: "id" },
  job_listings: {
    table: schema.job_listings,
    query: db.query.job_listings,
    idField: "id",
    excludeFromDuplicate: ["slug"],
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { model, id } = req.query;

  if (typeof model !== "string" || !(model in modelMap)) {
    return res.status(404).json({ message: "Model not found" });
  }

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const { table, query, idField, excludeFromDuplicate = [] } = modelMap[model];

  const supabase = createClient({
    req,
    res,
    query: {},
    resolvedUrl: "",
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const record = await query.findFirst({
      where: eq(table[idField], id),
    });

    if (!record) {
      return res.status(404).json({ message: `${model} not found` });
    }

    // Create a copy of the record without the excluded fields
    const dataToDuplicate = Object.keys(record).reduce(
      (acc, key) => {
        if (key !== idField && !excludeFromDuplicate.includes(key)) {
          acc[key] = record[key];
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    // Special handling for job_listings: generate a new unique slug
    if (model === "job_listings") {
      const originalSlug = record.slug || "";
      const randomStr = Math.random().toString(36).substring(2, 8); // 6 chars
      dataToDuplicate.slug = `${originalSlug}-copy-${randomStr}`;
    }

    const [duplicated] = (await db
      .insert(table)
      .values({ ...dataToDuplicate, created_at: new Date(), user_id: user.id })
      .returning()) as unknown as any[];

    return res.status(201).json(duplicated);
  } catch (error) {
    console.error(`Error duplicating ${model}:`, error);
    return res.status(500).json({ message: `Error duplicating ${model}` });
  }
}
