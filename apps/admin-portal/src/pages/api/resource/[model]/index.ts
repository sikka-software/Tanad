import { SupabaseClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

import { createApiHandler } from "@/lib/api-handler";
import type { Database } from "@/lib/db_types";

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
  clients: { tableName: "clients" },
  expenses: { tableName: "expenses" },
  departments: { tableName: "departments" },
  salaries: { tableName: "salaries" },

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
  employees: { tableName: "employees" },
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
  quotes: { tableName: "quotes" },
  vendors: { tableName: "vendors" },

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

        const { data, error } = await supabase.rpc(
          "get_activity_logs_with_user_email",
          { p_enterprise_id: enterprise_id },
        );

        if (error) {
          console.error("Error calling get_activity_logs_with_user_email RPC:", error);
          throw error;
        }

        return data ?? [];
      },
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { model } = req.query;

  if (typeof model !== "string" || !(model in modelMap)) {
    console.error(`>>> [${model}] Error: Model not found in modelMap <<<`);
    return res.status(404).json({ message: "Model not found" });
  }

  const config = modelMap[model as keyof typeof modelMap];

  if (!config) {
    console.error(`>>> [${model}] Error: No configuration found in modelMap <<<`);
    return res.status(500).json({ message: "Internal server configuration error" });
  }

  const { tableName, customHandlers } = config;

  return createApiHandler({ tableName, customHandlers })(req, res);
}
