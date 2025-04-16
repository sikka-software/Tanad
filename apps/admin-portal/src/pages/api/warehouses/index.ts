import { NextApiRequest, NextApiResponse } from "next";
import { desc } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { warehouses } from "@/db/schema";
import { Warehouse } from "@/types/warehouse.type";

// Helper to convert Drizzle warehouse to our Warehouse type
function convertDrizzleWarehouse(data: typeof warehouses.$inferSelect): Warehouse {
  return {
    id: data.id,
    name: data.name,
    code: data.code,
    address: data.address,
    city: data.city,
    state: data.state,
    zip_code: data.zipCode,
    capacity: data.capacity ? Number(data.capacity) : null,
    is_active: data.is_active,
    notes: data.notes,
    created_at: data.createdAt?.toString() || "",
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const warehousesList = await db.query.warehouses.findMany({
        orderBy: desc(warehouses.createdAt),
      });
      return res.status(200).json(warehousesList.map(convertDrizzleWarehouse));
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      return res.status(500).json({ message: "Error fetching warehouses" });
    }
  }

  if (req.method === "POST") {
    try {
      // Map warehouse data to match Drizzle schema
      const dbWarehouse = {
        ...req.body,
        zipCode: req.body.zip_code,
        is_active: req.body.is_active,
        capacity: req.body.capacity?.toString(),
      };

      const [warehouse] = await db.insert(warehouses).values(dbWarehouse).returning();
      return res.status(201).json(convertDrizzleWarehouse(warehouse));
    } catch (error) {
      console.error("Error creating warehouse:", error);
      return res.status(500).json({ message: "Error creating warehouse" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
} 