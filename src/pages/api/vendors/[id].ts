import { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { vendors } from "@/db/schema";
import { Vendor } from "@/types/vendor.type";

// Helper to convert Drizzle vendor to our Vendor type
function convertDrizzleVendor(data: typeof vendors.$inferSelect): Vendor {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    address: data.address,
    city: data.city,
    state: data.state,
    zip_code: data.zipCode,
    notes: data.notes,
    created_at: data.createdAt?.toString() || ""
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const vendor = await db.query.vendors.findFirst({
        where: eq(vendors.id, id as string),
      });

      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      return res.status(200).json(convertDrizzleVendor(vendor));
    } catch (error) {
      console.error("Error fetching vendor:", error);
      return res.status(500).json({ message: "Error fetching vendor" });
    }
  }

  if (req.method === "PUT") {
    try {
      // Convert snake_case to camelCase if zip_code is provided
      const dbVendor = req.body.zip_code
        ? {
            ...req.body,
            zipCode: req.body.zip_code,
          }
        : req.body;

      const [vendor] = await db
        .update(vendors)
        .set(dbVendor)
        .where(eq(vendors.id, id as string))
        .returning();

      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      return res.status(200).json(convertDrizzleVendor(vendor));
    } catch (error) {
      console.error("Error updating vendor:", error);
      return res.status(500).json({ message: "Error updating vendor" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await db.delete(vendors).where(eq(vendors.id, id as string));
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting vendor:", error);
      return res.status(500).json({ message: "Error deleting vendor" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
} 