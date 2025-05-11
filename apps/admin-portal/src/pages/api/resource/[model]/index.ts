import { SupabaseClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

import { createApiHandler } from "@/lib/api-handler";
import type { Database } from "@/lib/database.types";

// Assuming this path is correct

// Simplify ModelConfig signatures to match inferred createApiHandler behavior
type ModelConfig = {
  tableName: string;
  customHandlers?: {
    POST?: (
      supabase: SupabaseClient<Database>,
      user_id: string,
      enterprise_id: string, // POST seems to get enterprise_id
      req: NextApiRequest,
    ) => Promise<any>;
    GET?: (
      supabase: SupabaseClient<Database>,
      user_id: string,
      req: NextApiRequest, // GET likely doesn't get enterprise_id automatically
    ) => Promise<any>;
    DELETE?: (
      supabase: SupabaseClient<Database>,
      user_id: string,
      req: NextApiRequest, // DELETE likely doesn't get enterprise_id automatically
    ) => Promise<any>;
    PUT?: (
      supabase: SupabaseClient<Database>,
      user_id: string,
      req: NextApiRequest, // PUT likely doesn't get enterprise_id automatically
      id: string, // PUT needs id, passed separately by createApiHandler?
    ) => Promise<any>;
  };
};

const modelMap: Record<string, ModelConfig> = {
  branches: { tableName: "branches" },
  companies: { tableName: "companies" },
  jobs: { tableName: "jobs" },
  clients: {
    tableName: "clients",
    customHandlers: {
      GET: async (supabase: SupabaseClient<Database>, user_id: string, req: NextApiRequest) => {
        // 1. Get the user's enterprise_id
        const { data: membership, error: enterpriseError } = await supabase
          .from("memberships")
          .select("enterprise_id")
          .eq("profile_id", user_id)
          .maybeSingle();

        if (enterpriseError) {
          console.error("Error fetching enterprise ID for clients GET:", enterpriseError);
          throw new Error("Failed to retrieve enterprise association");
        }
        if (!membership?.enterprise_id) {
          throw new Error("User is not associated with an enterprise.");
        }
        const enterprise_id = membership.enterprise_id;

        // 2. Fetch clients with joined company name
        const { data, error } = await supabase
          .from("clients")
          .select("*, company:companies(id, name)")
          .eq("enterprise_id", enterprise_id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching clients with company name:", error);
          throw error;
        }
        return data;
      },
    },
  },
  expenses: { tableName: "expenses" },
  departments: { tableName: "departments" },
  salaries: { tableName: "salaries" },
  domains: { tableName: "domains" },
  servers: { tableName: "servers" },
  purchases: { tableName: "purchases" },
  websites: { tableName: "websites" },
  online_stores: { tableName: "online_stores" },
  department_locations: {
    tableName: "department_locations",
    customHandlers: {
      POST: async (
        supabase: SupabaseClient<Database>,
        user_id: string,
        enterprise_id: string,
        req: NextApiRequest,
      ) => {
        const locations = Array.isArray(req.body) ? req.body : [req.body];

        const validTypes = ["office", "branch", "warehouse"];
        for (const location of locations) {
          if (!location.type || !validTypes.includes(location.type)) {
            throw new Error(`Invalid location type. Must be one of: ${validTypes.join(", ")}`);
          }
        }

        const insertData = locations.map((location) => ({
          department_id: location.department_id,
          location_id: location.location_id,
          location_type: location.type,
          user_id: user_id,
          enterprise_id: enterprise_id,
        }));

        const { data: created, error } = await supabase
          .from("department_locations")
          .insert(insertData)
          .select();

        if (error) {
          console.error("Error in custom department_locations POST:", error);
          throw error;
        }

        return created;
      },
    },
  },
  offices: { tableName: "offices" },
  warehouses: { tableName: "warehouses" },
  employees: {
    tableName: "employees",
    customHandlers: {
      POST: async (supabase, user_id, enterprise_id, req) => {
        const { job_id, ...employeeData } = req.body;
        // 1. Insert employee
        const { data: employee, error: employeeError } = await supabase
          .from("employees")
          .insert({ ...employeeData, job_id, user_id, enterprise_id })
          .select()
          .single();
        if (employeeError) throw employeeError;
        // 2. If job_id present, increment occupied_positions
        if (job_id) {
          const { data: job, error: jobFetchError } = await supabase
            .from("jobs")
            .select("occupied_positions")
            .eq("id", job_id)
            .maybeSingle();
          if (jobFetchError) throw jobFetchError;
          const newOccupied = (job?.occupied_positions || 0) + 1;
          const { error: jobError } = await supabase
            .from("jobs")
            .update({ occupied_positions: newOccupied })
            .eq("id", job_id);
          if (jobError) throw jobError;
        }
        return employee;
      },
      PUT: async (supabase, user_id, req, id) => {
        // 1. Get the current employee
        const { data: currentEmployee, error: fetchError } = await supabase
          .from("employees")
          .select("job_id")
          .eq("id", id)
          .maybeSingle();
        if (fetchError) throw fetchError;
        const prevJobId = currentEmployee?.job_id;
        const { job_id, ...updateData } = req.body;
        // 2. Update the employee
        const { data: updatedEmployee, error: updateError } = await supabase
          .from("employees")
          .update({ ...updateData, job_id })
          .eq("id", id)
          .select()
          .single();
        if (updateError) throw updateError;
        // 3. If job_id changed, update occupied_positions
        if (prevJobId && prevJobId !== job_id) {
          // Decrement old job, but not below 0
          const { data: oldJob, error: oldJobFetchError } = await supabase
            .from("jobs")
            .select("occupied_positions")
            .eq("id", prevJobId)
            .maybeSingle();
          if (oldJobFetchError) throw oldJobFetchError;
          const newOccupied = Math.max((oldJob?.occupied_positions || 1) - 1, 0);
          await supabase
            .from("jobs")
            .update({ occupied_positions: newOccupied })
            .eq("id", prevJobId);
        }
        if (job_id && prevJobId !== job_id) {
          // Increment new job
          const { data: newJob, error: newJobFetchError } = await supabase
            .from("jobs")
            .select("occupied_positions")
            .eq("id", job_id)
            .maybeSingle();
          if (newJobFetchError) throw newJobFetchError;
          const newOccupied = (newJob?.occupied_positions || 0) + 1;
          await supabase
            .from("jobs")
            .update({ occupied_positions: newOccupied })
            .eq("id", job_id);
        }
        return updatedEmployee;
      },
    },
  },
  products: { tableName: "products" },
  invoices: {
    tableName: "invoices",
    customHandlers: {
      GET: async (supabase: SupabaseClient<Database>, user_id: string, req: NextApiRequest) => {
        const { data: membership, error: enterpriseError } = await supabase
          .from("memberships")
          .select("enterprise_id")
          .eq("profile_id", user_id)
          .maybeSingle();

        if (enterpriseError) {
          console.error("Error fetching enterprise ID for invoice GET:", enterpriseError);
          throw new Error("Failed to retrieve enterprise association");
        }
        if (!membership?.enterprise_id) {
          throw new Error("User is not associated with an enterprise.");
        }
        const enterprise_id = membership.enterprise_id;

        const { data, error } = await supabase
          .from("invoices")
          .select("*, client:clients(*)")
          .eq("enterprise_id", enterprise_id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching invoices with clients:", error);
          throw error;
        }
        return data;
      },
      POST: async (
        supabase: SupabaseClient<Database>,
        user_id: string,
        enterprise_id: string,
        req: NextApiRequest,
      ) => {
        const { items, ...invoiceData } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
          throw new Error("Invoice must contain at least one item.");
        }

        const valuesToInsert = {
          ...invoiceData,
          created_by: user_id,
          enterprise_id: enterprise_id,
        };

        const { data: createdInvoice, error: invoiceError } = await supabase
          .from("invoices")
          .insert(valuesToInsert)
          .select()
          .single();

        if (invoiceError) {
          console.error("Error inserting invoice:", invoiceError);
          throw invoiceError;
        }

        if (!createdInvoice || !createdInvoice.id) {
          console.error("Failed to create invoice or get ID");
          throw new Error("Failed to create invoice record.");
        }

        const invoiceItemsToInsert = items.map((item: any) => ({
          invoice_id: createdInvoice.id,
          product_id: item.product_id || null,
          description: item.description || "",
          quantity: item.quantity,
          unit_price: item.unit_price,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(invoiceItemsToInsert);

        if (itemsError) {
          console.error("Error inserting invoice items:", itemsError);
          throw new Error(`Failed to insert invoice items: ${itemsError.message}`);
        }

        return createdInvoice;
      },
    },
  },
  quotes: {
    tableName: "quotes",
    customHandlers: {
      GET: async (supabase: SupabaseClient<Database>, user_id: string, req: NextApiRequest) => {
        const { data: membership, error: enterpriseError } = await supabase
          .from("memberships")
          .select("enterprise_id")
          .eq("profile_id", user_id)
          .maybeSingle();

        if (enterpriseError) {
          console.error("Error fetching enterprise ID for quote GET:", enterpriseError);
          throw new Error("Failed to retrieve enterprise association");
        }
        if (!membership?.enterprise_id) {
          throw new Error("User is not associated with an enterprise.");
        }
        const enterprise_id = membership.enterprise_id;

        const { data, error } = await supabase
          .from("quotes")
          .select("*, client:clients(*)")
          .eq("enterprise_id", enterprise_id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching quotes with clients:", error);
          throw error;
        }
        return data;
      },
      POST: async (
        supabase: SupabaseClient<Database>,
        user_id: string,
        enterprise_id: string,
        req: NextApiRequest,
      ) => {
        const { items, ...quoteData } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
          throw new Error("Quote must contain at least one item.");
        }

        const valuesToInsert = {
          ...quoteData,
          created_by: user_id,
          enterprise_id: enterprise_id,
        };

        const { data: createdQuote, error: quoteError } = await supabase
          .from("quotes")
          .insert(valuesToInsert)
          .select()
          .single();

        if (quoteError) {
          console.error("Error inserting quote:", quoteError);
          throw quoteError;
        }

        if (!createdQuote || !createdQuote.id) {
          console.error("Failed to create quote or get ID");
          throw new Error("Failed to create quote record.");
        }

        const quoteItemsToInsert = items.map((item: any) => ({
          quote_id: createdQuote.id,
          product_id: item.product_id || null,
          description: item.description || "",
          quantity: item.quantity,
          unit_price: item.unit_price,
        }));

        const { error: itemsError } = await supabase
          .from("quote_items")
          .insert(quoteItemsToInsert);

        if (itemsError) {
          console.error("Error inserting quote items:", itemsError);
          // Potentially roll back quote creation or handle differently
          throw new Error(`Failed to insert quote items: ${itemsError.message}`);
        }

        return createdQuote;
      },
    },
  },
  vendors: { tableName: "vendors" },
  employee_requests: { tableName: "employee_requests" },
  job_listings: {
    tableName: "job_listings",
    customHandlers: {
      GET: async (supabase: SupabaseClient<Database>, user_id: string, req: NextApiRequest) => {
        // 1. Fetch enterprise_id for the user (required for filtering)
        const { data: membership, error: enterpriseError } = await supabase
          .from("memberships")
          .select("enterprise_id")
          .eq("profile_id", user_id)
          .maybeSingle();

        if (enterpriseError) {
          console.error("Error fetching enterprise ID for job listing GET:", enterpriseError);
          throw new Error("Failed to retrieve enterprise association");
        }
        if (!membership?.enterprise_id) {
          throw new Error("User is not associated with an enterprise.");
        }
        const enterprise_id = membership.enterprise_id;

        // 2. Fetch job listings with job count
        const { data, error } = await supabase
          .from("job_listings")
          .select(
            `
            *,
            job_listing_jobs (count)
          `,
          )
          .eq("enterprise_id", enterprise_id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching job listings with count:", error);
          throw error;
        }

        // 3. Map result to flatten the count
        return data.map((listing) => ({
          ...listing,
          jobs_count: listing.job_listing_jobs[0]?.count || 0,
        }));
      },
    },
  },
  activity: {
    tableName: "activity_logs",
    customHandlers: {
      GET: async (supabase: SupabaseClient<Database>, user_id: string, req: NextApiRequest) => {
        const { data: membership, error: enterpriseError } = await supabase
          .from("memberships")
          .select("enterprise_id")
          .eq("profile_id", user_id)
          .maybeSingle();

        if (enterpriseError) {
          console.error("Error fetching enterprise ID for activity logs:", enterpriseError);
          throw new Error("Failed to retrieve enterprise association for activity logs");
        }
        if (!membership?.enterprise_id) {
          throw new Error("User is not associated with an enterprise for activity logs");
        }
        const enterprise_id = membership.enterprise_id;

        const { data, error } = await supabase.rpc("get_activity_logs_with_user_email", {
          p_enterprise_id: enterprise_id,
        });

        if (error) {
          console.error("Error calling get_activity_logs_with_user_email RPC:", error);
          throw error;
        }

        return data ?? [];
      },
    },
  },
  cars: { tableName: "cars" },
  trucks: { tableName: "trucks" },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { model } = req.query;

  if (typeof model !== "string" || !(model in modelMap)) {
    return res.status(404).json({ message: "Module not found" });
  }

  const config = modelMap[model as keyof typeof modelMap];

  if (!config) {
    return res.status(500).json({ message: "Internal server configuration error" });
  }

  const { tableName, customHandlers } = config;

  return createApiHandler({ tableName, customHandlers })(req, res);
}
