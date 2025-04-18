import { inArray } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { salaries } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid salary IDs" });
    }

    await db.delete(salaries).where(inArray(salaries.id, ids));
    return res.status(204).end();
  } catch (error) {
    console.error("Error bulk deleting salaries:", error);
    return res.status(500).json({ message: "Error bulk deleting salaries" });
  }
}
