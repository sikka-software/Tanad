// src/pages/api/resource/[model]/[id].ts
import { SupabaseClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

import type { Database } from "@/lib/database.types";

// ModelConfig for single-resource endpoints
// id is passed to customHandlers for PUT/GET/DELETE
// (GET for single resource, PUT for update, DELETE for delete)
type ModelConfig = {
  tableName: string;
  customHandlers?: {
    GET?: (
      supabase: SupabaseClient<Database>,
      user_id: string,
      req: NextApiRequest,
      id: string,
    ) => Promise<any>;
    PUT?: (
      supabase: SupabaseClient<Database>,
      user_id: string,
      req: NextApiRequest,
      id: string,
    ) => Promise<any>;
    DELETE?: (
      supabase: SupabaseClient<Database>,
      user_id: string,
      req: NextApiRequest,
      id: string,
    ) => Promise<any>;
  };
};

const modelMap: Record<string, ModelConfig> = {
  branches: { tableName: "branches" },
  companies: { tableName: "companies" },
  jobs: { tableName: "jobs" },
  expenses: { tableName: "expenses" },
  departments: { tableName: "departments" },
  salaries: { tableName: "salaries" },
  domains: { tableName: "domains" },
  servers: { tableName: "servers" },
  purchases: { tableName: "purchases" },
  websites: { tableName: "websites" },
  online_stores: { tableName: "online_stores" },
  offices: { tableName: "offices" },
  warehouses: { tableName: "warehouses" },
  products: { tableName: "products" },
  cars: { tableName: "cars" },
  trucks: { tableName: "trucks" },
  vendors: { tableName: "vendors" },
  employee_requests: { tableName: "employee_requests" },
  bank_accounts: { tableName: "bank_accounts" },
  clients: { tableName: "clients" },
  department_locations: { tableName: "department_locations" },
  employees: { tableName: "employees" },
  invoices: {
    tableName: "invoices",
    customHandlers: {
      GET: async (supabase, user_id, req, id) => {
        // Fetch the invoice
        const { data: invoice, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        if (!invoice) throw new Error("Invoice not found");

        // Fetch the related items from invoice_items table
        const { data: items, error: itemsError } = await supabase
          .from("invoice_items")
          .select("id, description, quantity, unit_price, product_id")
          .eq("invoice_id", id);

        if (itemsError) {
          console.error("Error fetching invoice items:", itemsError);
          throw itemsError;
        }

        console.log("Fetched invoice items:", items); // Debug log

        // If client_id exists, fetch client data
        let client = null;
        if (invoice.client_id) {
          const { data: clientData, error: clientError } = await supabase
            .from("clients")
            .select("*")
            .eq("id", invoice.client_id)
            .maybeSingle();

          if (!clientError) {
            client = clientData;
          }
        }

        // Return the invoice with items and client data
        return {
          ...invoice,
          items: items || [], // Include the items array
          client,
        };
      },
    },
  },
  quotes: { tableName: "quotes" },
  job_listings: {
    tableName: "job_listings",
    customHandlers: {
      GET: async (supabase, user_id, req, id) => {
        // Fetch the job listing by ID
        const { data: record, error } = await supabase
          .from("job_listings")
          .select("*, job_listing_jobs(job_id)")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        if (!record) throw new Error("job_listing not found");
        // Consolidate jobs from job_listing_jobs only
        const jobs = Array.isArray(record.job_listing_jobs)
          ? record.job_listing_jobs.map((j: any) => j.job_id)
          : [];
        const { job_listing_jobs, jobs: _jobs, ...rest } = record as any;
        return {
          ...rest,
          jobs,
          jobs_count: jobs.length,
        };
      },
      PUT: async (supabase, user_id, req, id) => {
        // Update the job listing
        const { data: updated, error } = await supabase
          .from("job_listings")
          .update({ ...req.body, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        // Fetch associated jobs
        const { data: jobLinks, error: jobsError } = await supabase
          .from("job_listing_jobs")
          .select("job_id")
          .eq("job_listing_id", id);
        if (jobsError) throw jobsError;
        return {
          ...updated,
          jobs: jobLinks?.map((j: any) => j.job_id) || [],
          jobs_count: jobLinks?.length || 0,
        };
      },
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { model, id } = req.query;
  if (typeof model !== "string" || !(model in modelMap)) {
    return res.status(404).json({ message: "Module not found" });
  }
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }
  const config = modelMap[model as keyof typeof modelMap];
  if (!config) {
    return res.status(500).json({ message: "Internal server configuration error" });
  }
  const { tableName, customHandlers } = config;

  // Custom createApiHandler for single-resource endpoints
  async function singleResourceHandler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = (await import("@/utils/supabase/server-props")).createClient({
      req,
      res,
      query: {},
      resolvedUrl: "",
    });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user_id = user.id;
    // id is guaranteed to be a string here
    const resourceId = id as string;
    try {
      switch (req.method) {
        case "GET":
          if (customHandlers?.GET) {
            const data = await customHandlers.GET(supabase, user_id, req, resourceId);
            return res.status(200).json(data);
          }
          // Default GET: fetch by id
          const { data: record, error } = await supabase
            .from(tableName)
            .select("*")
            .eq("id", resourceId)
            .maybeSingle();
          if (error) throw error;
          if (!record) return res.status(404).json({ message: `${model} not found` });
          return res.status(200).json(record);
        case "PUT":
          if (customHandlers?.PUT) {
            const data = await customHandlers.PUT(supabase, user_id, req, resourceId);
            return res.status(200).json(data);
          }
          // Default PUT: update by id
          const { data: updated, error: updateError } = await supabase
            .from(tableName)
            .update({ ...req.body, updated_at: new Date().toISOString() })
            .eq("id", resourceId)
            .select()
            .single();
          if (updateError) throw updateError;
          return res.status(200).json(updated);
        case "DELETE":
          if (customHandlers?.DELETE) {
            await customHandlers.DELETE(supabase, user_id, req, resourceId);
            return res.status(204).end();
          }
          // Default DELETE: delete by id
          const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .eq("id", resourceId);
          if (deleteError) throw deleteError;
          return res.status(204).end();
        default:
          res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
          return res.status(405).json({ message: `Method ${req.method} not allowed` });
      }
    } catch (error: any) {
      console.error(`Error in ${req.method} /api/resource/${tableName}/${resourceId}:`, error);
      const message = error.message || `Error handling ${req.method} for ${tableName}`;
      const status = typeof error.status === "number" ? error.status : 400;
      return res.status(status).json({ message });
    }
  }

  return singleResourceHandler(req, res);
}
