// src/pages/api/resource/[model]/[id].ts
import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

type ModelConfig = {
  table: any;
  query: {
    findFirst: (config: { where: any }) => Promise<any>;
  };
  idField: string;
};

const modelMap: Record<string, ModelConfig> = {
  branches: { table: schema.branches, query: db.query.branches, idField: "id" },
  companies: { table: schema.companies, query: db.query.companies, idField: "id" },
  jobs: { table: schema.jobs, query: db.query.jobs, idField: "id" },
  clients: { table: schema.clients, query: db.query.clients, idField: "id" },
  expenses: { table: schema.expenses, query: db.query.expenses, idField: "id" },
  departments: { table: schema.departments, query: db.query.departments, idField: "id" },
  departmentLocations: {
    table: schema.departmentLocations,
    query: db.query.departmentLocations,
    idField: "id",
  },
  offices: { table: schema.offices, query: db.query.offices, idField: "id" },
  warehouses: { table: schema.warehouses, query: db.query.warehouses, idField: "id" },
  employees: { table: schema.employees, query: db.query.employees, idField: "id" },
  products: { table: schema.products, query: db.query.products, idField: "id" },
  invoices: { table: schema.invoices, query: db.query.invoices, idField: "id" },
  quotes: { table: schema.quotes, query: db.query.quotes, idField: "id" },
  vendors: { table: schema.vendors, query: db.query.vendors, idField: "id" },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { model, id } = req.query;

  // Validate model
  if (typeof model !== "string" || !(model in modelMap)) {
    return res.status(404).json({ message: "Model not found" });
  }

  // Validate ID
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  // Get model configuration
  const { table, query, idField } = modelMap[model];

  // Authenticate user
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

  // Handle GET request
  if (req.method === "GET") {
    try {
      const record = await query.findFirst({
        where: eq(table[idField], id),
      });

      if (!record) {
        return res.status(404).json({ message: `${model} not found` });
      }
      return res.status(200).json(record);
    } catch (error) {
      console.error(`Error fetching ${model}:`, error);
      return res.status(500).json({ message: `Error fetching ${model}` });
    }
  }
  // Handle PUT request
  if (req.method === "PUT") {
    try {
      const existingRecord = await query.findFirst({
        where: eq(table[idField], id),
      });

      if (!existingRecord) {
        return res.status(404).json({ message: `${model} not found` });
      }

      // Check ownership if the model has a user_id field
      if ("user_id" in existingRecord && existingRecord.user_id !== user.id) {
        return res.status(403).json({ error: `Not authorized to update this ${model}` });
      }

      const [updatedRecord] = await db
        .update(table)
        .set(req.body)
        .where(eq(table[idField], id))
        .returning();

      if (!updatedRecord) {
        return res.status(404).json({ message: `${model} not found` });
      }

      return res.status(200).json(updatedRecord);
    } catch (error) {
      console.error(`Error updating ${model}:`, error);
      return res.status(500).json({ message: `Error updating ${model}` });
    }
  }

  // Handle DELETE request
  if (req.method === "DELETE") {
    try {
      // Optional: Check ownership before deletion
      if ("user_id" in table) {
        const existingRecord = await query.findFirst({
          where: eq(table[idField], id),
        });

        if (existingRecord && "user_id" in existingRecord && existingRecord.user_id !== user.id) {
          return res.status(403).json({ error: `Not authorized to delete this ${model}` });
        }
      }

      await db.delete(table).where(eq(table[idField], id));
      return res.status(204).end();
    } catch (error) {
      console.error(`Error deleting ${model}:`, error);
      return res.status(500).json({ message: `Error deleting ${model}` });
    }
  }

  return res
    .status(405)
    .json({ message: "Method not allowed, only GET, PUT and DELETE are allowed" });
}
