import { sql } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { employees } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the user ID from the Authorization header
    const user_id = req.headers.authorization?.replace("Bearer ", "");
    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      position,
      department,
      department_id,
      hireDate,
      salary,
      status,
      notes,
    } = req.body;

    const [employee] = await db
      .insert(employees)
      .values({
        user_id,
        first_name,
        last_name,
        email,
        phone,
        position,
        department_id,
        hireDate,
        salary: salary ? sql`${salary}::numeric` : null,
        status,
        notes,
      })
      .returning();

    return res.status(201).json(employee);
  } catch (error) {
    console.error("Error creating employee:", error);
    return res.status(500).json({ error: "Failed to create employee" });
  }
}
