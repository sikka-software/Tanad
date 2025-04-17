import { NextApiRequest, NextApiResponse } from "next";

import { desc } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { vendors } from "@/db/schema";
import { Vendor } from "@/types/vendor";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const vendorsList = await db.query.vendors.findMany({
        orderBy: [desc(vendors.createdAt)],
      });

      res.status(200).json(vendorsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vendors" });
    }
  } else if (req.method === "POST") {
    try {
      const data = req.body;
      const [newVendor] = await db
        .insert(vendors)
        .values({
          name: data.name,
          company: data.company,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          notes: data.notes,
          user_id: data.user_id,
        })
        .returning();

      res.status(201).json(newVendor);
    } catch (error) {
      res.status(500).json({ error: "Failed to create vendor" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
