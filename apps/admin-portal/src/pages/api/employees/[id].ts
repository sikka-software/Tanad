import { NextApiRequest, NextApiResponse } from "next";

import { sql } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { employees } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      const {
        userId,
        first_name,
        last_name,
        email,
        phone,
        position,
        departmentId,
        hireDate,
        salary,
        status,
        notes,
      } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // First verify that this employee belongs to the user
      const [existingEmployee] = await db
        .select()
        .from(employees)
        .where(sql`${employees.id} = ${id} AND ${employees.userId} = ${userId}`);

      if (!existingEmployee) {
        return res.status(404).json({ error: "Employee not found or access denied" });
      }

      // Perform the update
      const [updatedEmployee] = await db
        .update(employees)
        .set({
          first_name,
          last_name,
          email,
          phone,
          position,
          departmentId,
          hireDate,
          salary: salary ? sql`${salary}::numeric` : null,
          status,
          notes,
        })
        .where(sql`${employees.id} = ${id}`)
        .returning();

      return res.status(200).json(updatedEmployee);
    } catch (error) {
      console.error("Error updating employee:", error);
      return res.status(500).json({ error: "Failed to update employee" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
