import { NextApiRequest, NextApiResponse } from "next";
import { desc } from "drizzle-orm";

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
  if (req.method === "GET") {
    try {
      const vendorsList = await db.query.vendors.findMany({
        orderBy: desc(vendors.createdAt)
      });
      return res.status(200).json(vendorsList.map(convertDrizzleVendor));
    } catch (error) {
      console.error("Error fetching vendors:", error);
      return res.status(500).json({ message: "Error fetching vendors" });
    }
  }

  if (req.method === "POST") {
    try {
      // Map vendor data to match Drizzle schema
      const dbVendor = {
        ...req.body,
        zipCode: req.body.zip_code,
      };

      const [vendor] = await db.insert(vendors).values(dbVendor).returning();
      return res.status(201).json(convertDrizzleVendor(vendor));
    } catch (error) {
      console.error("Error creating vendor:", error);
      return res.status(500).json({ message: "Error creating vendor" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
} 