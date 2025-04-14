import { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { companies } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      const updates = req.body;
      
      const result = await db
        .update(companies)
        .set(updates)
        .where(eq(companies.id, id as string))
        .returning();

      if (!result.length) {
        return res.status(404).json({ message: "Company not found" });
      }

      return res.status(200).json(result[0]);
    } catch (error) {
      console.error("Error updating company:", error);
      return res.status(500).json({ message: "Error updating company" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
} 