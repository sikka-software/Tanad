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
  companies: { table: schema.companies, query: db.query.companies, idField: "id" },
  jobs: { table: schema.jobs, query: db.query.jobs, idField: "id" },
  clients: { table: schema.clients, query: db.query.clients, idField: "id" },
  expenses: { table: schema.expenses, query: db.query.expenses, idField: "id" },
  departments: { table: schema.departments, query: db.query.departments, idField: "id" },
  departmentLocations: {
    table: schema.department_locations,
    query: db.query.department_locations,
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

    if ("user_id" in record && record.user_id !== user.id) {
      return res.status(403).json({ error: `Not authorized to duplicate this ${model}` });
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

    const [duplicated] = (await db
      .insert(table)
      .values(dataToDuplicate)
      .returning()) as unknown as any[];

    return res.status(201).json(duplicated);
  } catch (error) {
    console.error(`Error duplicating ${model}:`, error);
    return res.status(500).json({ message: `Error duplicating ${model}` });
  }
}
