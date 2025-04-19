import { inArray } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { employeeRequests } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid or empty ids array" });
    }

    await db.delete(employeeRequests).where(inArray(employeeRequests.id, ids));

    return res.status(200).json({ message: "Employee requests deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee requests:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
