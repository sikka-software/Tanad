import { NextApiRequest, NextApiResponse } from "next";

import { sql } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { employees } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      hireDate,
      salary,
      isActive,
      notes,
    } = req.body;

    const [employee] = await db
      .insert(employees)
      .values({
        firstName,
        lastName,
        email,
        phone,
        position,
        department,
        hireDate,
        salary: salary ? sql`${salary}::numeric` : null,
        isActive,
        notes,
      })
      .returning();

    return res.status(201).json(employee);
  } catch (error) {
    console.error("Error creating employee:", error);
    return res.status(500).json({ error: "Failed to create employee" });
  }
}
