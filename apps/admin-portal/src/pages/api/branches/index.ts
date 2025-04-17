import { NextApiRequest, NextApiResponse } from "next";
import { desc } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { branches } from "@/db/schema";
import { Branch } from "@/types/branch.type";

// Helper to convert Drizzle branch to our Branch type
function convertDrizzleBranch(data: typeof branches.$inferSelect): Branch {
  return {
    id: data.id,
    name: data.name,
    code: data.code,
    address: data.address,
    city: data.city,
    state: data.state,
    zip_code: data.zipCode,
    phone: data.phone,
    email: data.email,
    manager: data.manager,
    is_active: data.is_active,
    notes: data.notes,
    created_at: data.created_at?.toString() || "",
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const branchesList = await db.query.branches.findMany({
        orderBy: desc(branches.created_at),
      });
      return res.status(200).json(branchesList.map(convertDrizzleBranch));
    } catch (error) {
      console.error("Error fetching branches:", error);
      return res.status(500).json({ message: "Error fetching branches" });
    }
  }

  if (req.method === "POST") {
    try {
      // Map branch data to match Drizzle schema
      const dbBranch = {
        ...req.body,
        zipCode: req.body.zip_code,
        is_active: req.body.is_active,
      };

      const [branch] = await db.insert(branches).values(dbBranch).returning();
      return res.status(201).json(convertDrizzleBranch(branch));
    } catch (error) {
      console.error("Error creating branch:", error);
      return res.status(500).json({ message: "Error creating branch" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
} 