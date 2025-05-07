// src/pages/api/resource/[model]/[id].ts
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
};

const modelMap: Record<string, ModelConfig> = {
  branches: { table: schema.branches, query: db.query.branches, idField: "id" },
  companies: { table: schema.companies, query: db.query.companies, idField: "id" },
  jobs: { table: schema.jobs, query: db.query.jobs, idField: "id" },
  domains: { table: schema.domains, query: db.query.domains, idField: "id" },
  servers: { table: schema.servers, query: db.query.servers, idField: "id" },
  clients: { table: schema.clients, query: db.query.clients, idField: "id" },
  expenses: { table: schema.expenses, query: db.query.expenses, idField: "id" },
  purchases: { table: schema.purchases, query: db.query.purchases, idField: "id" },
  departments: { table: schema.departments, query: db.query.departments, idField: "id" },
  department_locations: {
    table: schema.department_locations,
    query: db.query.department_locations,
    idField: "id",
  },
  salaries: { table: schema.salaries, query: db.query.salaries, idField: "id" },
  offices: { table: schema.offices, query: db.query.offices, idField: "id" },
  warehouses: { table: schema.warehouses, query: db.query.warehouses, idField: "id" },
  employees: { table: schema.employees, query: db.query.employees, idField: "id" },
  products: { table: schema.products, query: db.query.products, idField: "id" },
  invoices: { table: schema.invoices, query: db.query.invoices, idField: "id" },
  quotes: { table: schema.quotes, query: db.query.quotes, idField: "id" },
  vendors: { table: schema.vendors, query: db.query.vendors, idField: "id" },
  employee_requests: {
    table: schema.employee_requests,
    query: db.query.employee_requests,
    idField: "id",
  },
  job_listings: {
    table: schema.job_listings,
    query: db.query.job_listings,
    idField: "id",
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { model, id } = req.query;
  console.log("API Handler - Received request for model:", model, "with ID:", id);
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

  console.log(`API Handler - Authenticated user ID: ${user.id}`);

  // Handle GET request
  if (req.method === "GET") {
    try {
      const record = await query.findFirst({
        where: eq(table[idField], id),
      });

      console.log("record is ", record);

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
    console.log("API Handler - PUT request received");
    try {
      const existingRecord = await query.findFirst({
        where: eq(table[idField], id),
      });

      if (!existingRecord) {
        return res.status(404).json({ message: `${model} not found` });
      }

      console.log("API Handler - Existing record found:", JSON.stringify(existingRecord, null, 2));

      // Check ownership if the model has a user_id field (Example - adjust if needed)
      // Assuming enterprise_id implies ownership/permission in this context
      if ("enterprise_id" in existingRecord) {
        // Fetch user's enterprise membership if not already available
        const { data: membership, error: enterpriseError } = await supabase
          .from("memberships")
          .select("enterprise_id")
          .eq("profile_id", user.id)
          .maybeSingle();

        if (enterpriseError || !membership?.enterprise_id) {
          console.error("Failed to verify enterprise membership for update:", enterpriseError);
          return res.status(403).json({ error: `Failed to verify authorization for ${model}` });
        }

        console.log(`API Handler - User's membership enterprise ID: ${membership.enterprise_id}`);

        if (existingRecord.enterprise_id !== membership.enterprise_id) {
          console.error(
            `Authorization failed: Record enterprise ID (${existingRecord.enterprise_id}) !== User enterprise ID (${membership.enterprise_id})`,
          );
          return res.status(403).json({ error: `Not authorized to update this ${model}` });
        }
      }

      console.log("API Handler - req.body before update:", JSON.stringify(req.body, null, 2));

      // --- Explicitly define fields to update ---
      const {
        // Exclude fields not meant for direct update
        id: _id,
        created_at: _createdAt,
        updated_at: _updatedAt,
        created_by: _createdBy,
        enterprise_id: _enterpriseId, // Also exclude enterprise_id from spread if present in body
        // Include other fields from req.body that ARE updatable
        ...updatableDataFromRequest
      } = req.body;

      // Explicitly add the user's enterprise_id to the update payload
      const updatableData = {
        ...updatableDataFromRequest,
        enterprise_id: existingRecord.enterprise_id, // Use the enterprise_id from the record being updated
      };
      // --- End Explicit Update Definition ---

      console.log(
        "API Handler - Data being sent to Supabase update:",
        JSON.stringify(updatableData, null, 2),
      );

      // Perform the update using the AUTHENTICATED supabase client
      // Use the actual model name string from the query param
      const { data: updatedRecord, error: updateError } = await supabase
        .from(model) // Use model name string directly
        .update(updatableData) // Use the data with enterprise_id added
        .eq(idField, id)
        .select()
        .single(); // Assuming you expect one record back

      console.log("API Handler - Updated record:", JSON.stringify(updatedRecord, null, 2));
      if (updateError) {
        console.error(`Supabase update error for ${model}:`, updateError);
        // Throw the specific Supabase error for better debugging
        throw updateError;
      }

      if (!updatedRecord) {
        // This could happen if RLS prevents seeing the updated record
        console.warn(
          `Update operation on ${model} ${id} seemed successful but SELECT returned no data. Check RLS.`,
        );
        return res
          .status(404)
          .json({ message: `${model} not found or update failed silently (potentially RLS)` });
      }

      return res.status(200).json(updatedRecord);
    } catch (error: any) {
      console.error(`Raw error object updating ${model}:`, error);
      console.error(`Stringified error object updating ${model}:`, JSON.stringify(error, null, 2));
      console.error(`Error message updating ${model}:`, error?.message);
      const errorMessage =
        error?.message || JSON.stringify(error) || "Unknown error occurred during update";
      return res.status(500).json({
        message: `Error updating ${model}: ${errorMessage}`,
        errorDetails: error, // Also include the raw error in the response if possible
      });
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
