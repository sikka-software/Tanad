import { NextApiRequest, NextApiResponse } from "next";

import { createApiHandler } from "@/lib/api-handler";

import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

type ModelConfig = {
  table: any;
  query: any;
  customHandlers?: {
    POST?: (user_id: string, req: NextApiRequest) => Promise<any>;
    GET?: (user_id: string, req: NextApiRequest) => Promise<any>;
    DELETE?: (user_id: string, req: NextApiRequest) => Promise<any>;
  };
};

const modelMap: Record<string, ModelConfig> = {
  branches: { table: schema.branches, query: db.query.branches },
  companies: { table: schema.companies, query: db.query.companies },
  jobs: { table: schema.jobs, query: db.query.jobs },
  clients: { table: schema.clients, query: db.query.clients },
  expenses: { table: schema.expenses, query: db.query.expenses },
  departments: { table: schema.departments, query: db.query.departments },
  departmentLocations: {
    table: schema.departmentLocations,
    query: db.query.departmentLocations,
    customHandlers: {
      POST: async (user_id_param: string, req: NextApiRequest) => {
        const supabase = createClient({
          req,
          res: {} as NextApiResponse,
          query: {},
          resolvedUrl: "",
        });
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.id) {
          throw new Error("Unauthorized");
        }
        const user_id = user.id;
        const enterprise_id = user.app_metadata.enterprise_id;
        if (!enterprise_id) {
          throw new Error("Enterprise association not found for user");
        }

        const locations = Array.isArray(req.body) ? req.body : [req.body];

        console.log("Request body:", req.body);
        console.log("Locations:", locations);

        // Validate location types
        const validTypes = ["office", "branch", "warehouse"];
        for (const location of locations) {
          console.log("Location:", location);
          if (!location.type || !validTypes.includes(location.type)) {
            throw new Error(`Invalid location type. Must be one of: ${validTypes.join(", ")}`);
          }
        }

        const [created] = await db
          .insert(schema.departmentLocations)
          .values(
            locations.map((location) => ({
              department_id: location.department_id,
              locationId: location.location_id,
              locationType: location.type,
              user_id: user_id,
              enterprise_id: enterprise_id,
            })),
          )
          .returning();
        return created;
      },
    },
  },
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

  const { table, query, customHandlers } = modelMap[model as keyof typeof modelMap];

  return createApiHandler({ table, query, customHandlers })(req, res);
}
