import { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";

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
    created_at: data.created_at?.toString() || "",
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const warehouse = await db.query.warehouses.findFirst({
        where: eq(warehouses.id, id as string),
      });

      if (!warehouse) {
        return res.status(404).json({ message: "Warehouse not found" });
      }

      return res.status(200).json(convertDrizzleWarehouse(warehouse));
    } catch (error) {
      console.error("Error fetching warehouse:", error);
      return res.status(500).json({ message: "Error fetching warehouse" });
    }
  }

  if (req.method === "PUT") {
    try {
      // Map warehouse data to match Drizzle schema
      const dbWarehouse = {
        ...req.body,
        zipCode: req.body.zip_code,
        is_active: req.body.is_active,
        capacity: req.body.capacity?.toString(),
      };

      const [warehouse] = await db
        .update(warehouses)
        .set(dbWarehouse)
        .where(eq(warehouses.id, id as string))
        .returning();

      if (!warehouse) {
        return res.status(404).json({ message: "Warehouse not found" });
      }

      return res.status(200).json(convertDrizzleWarehouse(warehouse));
    } catch (error) {
      console.error("Error updating warehouse:", error);
      return res.status(500).json({ message: "Error updating warehouse" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await db.delete(warehouses).where(eq(warehouses.id, id as string));
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      return res.status(500).json({ message: "Error deleting warehouse" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
} 