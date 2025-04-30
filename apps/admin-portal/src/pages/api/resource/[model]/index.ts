import { NextApiRequest, NextApiResponse } from "next";
import { SupabaseClient } from "@supabase/supabase-js";

import { createApiHandler } from "@/lib/api-handler";

import { createClient } from "@/utils/supabase/server-props";

type ModelConfig = {
  tableName: string;
  customHandlers?: {
    POST?: (supabase: SupabaseClient, user_id: string, enterprise_id: string, req: NextApiRequest) => Promise<any>;
    GET?: (supabase: SupabaseClient, user_id: string, req: NextApiRequest) => Promise<any>;
    DELETE?: (supabase: SupabaseClient, user_id: string, req: NextApiRequest) => Promise<any>;
  };
};

const modelMap: Record<string, ModelConfig> = {
  branches: { tableName: "branches" },
  companies: { tableName: "companies" },
  jobs: { tableName: "jobs" },
  clients: { tableName: "clients" },
  expenses: { tableName: "expenses" },
  departments: { tableName: "departments" },
  department_locations: {
    tableName: "department_locations",
    customHandlers: {
      POST: async (supabase: SupabaseClient, user_id: string, enterprise_id: string, req: NextApiRequest) => {
        const locations = Array.isArray(req.body) ? req.body : [req.body];

        console.log("Locations in custom handler:", locations);

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
        
        console.log("Custom department_locations POST successful:", created);
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
      POST: async (supabase: SupabaseClient, user_id: string, enterprise_id: string, req: NextApiRequest) => {
        console.log(">>> Custom invoice POST handler invoked (Supabase version) <<<");
        console.log("Original req.body:", req.body);
        
        const { items, ...invoiceData } = req.body;
        
        console.log("Invoice Data (excluding items):", invoiceData);
        console.log("Items received:", items);

        if (!Array.isArray(items) || items.length === 0) {
          throw new Error("Invoice must contain at least one item.");
        }

        const valuesToInsert = {
          ...invoiceData,
          created_by: user_id,
          enterprise_id: enterprise_id,
        };
        console.log("Final invoice values being inserted:", valuesToInsert);
        
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

        console.log(">>> Invoice created successfully (Supabase version) <<<", createdInvoice);

        const invoiceItemsToInsert = items.map((item: any) => ({
          invoice_id: createdInvoice.id,
          product_id: item.product_id || null,
          description: item.description || "",
          quantity: item.quantity,
          unit_price: item.unit_price,
        }));

        console.log("Invoice items to insert:", invoiceItemsToInsert);

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(invoiceItemsToInsert);

        if (itemsError) {
            console.error("Error inserting invoice items:", itemsError);
            throw new Error(`Failed to insert invoice items: ${itemsError.message}`);
        }

        console.log(">>> Invoice items inserted successfully <<<");

        return createdInvoice;
      },
    },
  },
  quotes: { tableName: "quotes" },
  vendors: { tableName: "vendors" },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { model } = req.query;

  if (typeof model !== "string" || !(model in modelMap)) {
    return res.status(404).json({ message: "Model not found" });
  }

  const config = modelMap[model as keyof typeof modelMap];
  
  if (!config) {
      console.error(`>>> [${model}] Error: No configuration found in modelMap <<<`);
      return res.status(500).json({ message: "Internal server configuration error" });
  }

  const { tableName, customHandlers } = config;

  console.log(`>>> [${model}] Passing to createApiHandler: <<<`);
  console.log("TableName:", tableName);
  console.log("Custom Handlers defined:", !!customHandlers);
  console.log("Custom POST defined:", !!customHandlers?.POST);

  return createApiHandler({ tableName, customHandlers })(req, res);
}
