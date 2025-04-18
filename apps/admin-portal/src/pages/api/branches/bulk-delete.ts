import { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { branches } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    // Delete all branches with the given IDs
    await db.delete(branches).where(eq(branches.id, ids[0]));

    // If there are more IDs, delete them one by one
    for (let i = 1; i < ids.length; i++) {
      await db.delete(branches).where(eq(branches.id, ids[i]));
    }

    return res.status(204).end();
  } catch (error) {
    console.error("Error deleting branches:", error);
    return res.status(500).json({ message: "Error deleting branches" });
  }
} 