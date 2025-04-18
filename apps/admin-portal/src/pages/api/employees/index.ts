import { NextApiRequest, NextApiResponse } from "next";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { employees } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const employeesList = await db.select().from(employees).orderBy(desc(employees.created_at));

    return res.status(200).json({ employees: employeesList });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({ error: "Failed to fetch employees" });
  }
}
