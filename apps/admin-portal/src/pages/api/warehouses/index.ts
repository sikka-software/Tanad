import { eq, desc } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { warehouses } from "@/db/schema";
import { WarehouseCreateData } from "@/modules/warehouse/warehouse.type";
import { createClient } from "@/utils/supabase/server-props";

// Helper to convert Drizzle warehouse to our Warehouse type
function convertDrizzleWarehouse(data: typeof warehouses.$inferSelect) {
  return {
    id: data.id,
    name: data.name,
    code: data.code,
    address: data.address,
    city: data.city,
    state: data.state,
    zip_code: data.zip_code,
    capacity: data.capacity ? Number(data.capacity) : null,
    is_active: data.is_active,
    notes: data.notes,
    created_at: data.created_at?.toString() || "",
  };
}

// Helper to convert our Warehouse type to Drizzle warehouse
function convertToDrizzleWarehouse(data: WarehouseCreateData & { user_id: string }) {
  return {
    name: data.name,
    code: data.code,
    address: data.address,
    city: data.city,
    state: data.state,
    zip_code: data.zip_code,
    capacity: data.capacity?.toString(),
    is_active: data.is_active,
    notes: data.notes,
    user_id: data.user_id,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient({
    req,
    res,
    query: {},
    resolvedUrl: "",
  });

  if (req.method === "GET") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const warehousesList = await db.query.warehouses.findMany({
        where: eq(warehouses.user_id, user?.id),
        orderBy: desc(warehouses.created_at),
      });
      return res.status(200).json(warehousesList.map(convertDrizzleWarehouse));
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      return res.status(500).json({ error: "Failed to fetch warehouses" });
    }
  }

  if (req.method === "POST") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const data = req.body;
      const [newWarehouse] = await db.insert(warehouses).values(data).returning();
      return res.status(201).json(convertDrizzleWarehouse(newWarehouse));
    } catch (error) {
      console.error("Error creating warehouse:", error);
      return res.status(500).json({ error: "Failed to create warehouse" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
