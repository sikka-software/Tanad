import { desc, eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { vendors } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

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
      const result = await db.select().from(vendors).where(eq(vendors.user_id, user?.id));
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vendors" });
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
          zip_code: data.zip_code,
          notes: data.notes,
          user_id: user?.id,
        })
        .returning();

      res.status(201).json(newVendor);
    } catch (error) {
      res.status(500).json({ error: "Failed to create vendor" });
    }
  }

  res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
