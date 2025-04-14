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
    zipCode: data.zipCode,
    notes: data.notes,
    createdAt: data.createdAt?.toString() || "",
    userId: data.userId,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid vendor ID" });
  }

  if (req.method === "GET") {
    try {
      const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));

      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }

      res.status(200).json(convertDrizzleVendor(vendor));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vendor" });
    }
  } else if (req.method === "PUT") {
    try {
      const data = req.body;
      const [updatedVendor] = await db
        .update(vendors)
        .set({
          name: data.name,
          company: data.company,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          notes: data.notes,
        })
        .where(eq(vendors.id, id))
        .returning();

      if (!updatedVendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }

      res.status(200).json(convertDrizzleVendor(updatedVendor));
    } catch (error) {
      res.status(500).json({ error: "Failed to update vendor" });
    }
  } else if (req.method === "DELETE") {
    try {
      const [deletedVendor] = await db.delete(vendors).where(eq(vendors.id, id)).returning();

      if (!deletedVendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }

      res.status(200).json(convertDrizzleVendor(deletedVendor));
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vendor" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
