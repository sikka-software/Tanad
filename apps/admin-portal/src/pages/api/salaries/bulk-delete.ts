import { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { salaries } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "Invalid request body. Expected array of ids." });
    }

    if (!db) throw new Error("Database connection not initialized");

    // Delete all salaries in the array
    for (const id of ids) {
      await db.delete(salaries).where(eq(salaries.id, id));
    }

    return res.status(200).json({ message: "Salaries deleted successfully" });
  } catch (error) {
    console.error("Error in bulk delete salaries API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
} 