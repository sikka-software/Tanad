/**
 * @openapi
 * /api/employees/{id}:
 *   get:
 *     tags: [Employees]
 *     summary: Get an employee by ID
 *     parameters:
 *       - $ref: '#/components/parameters/employeeId'
 *     responses:
 *       200:
 *         description: Employee found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 */
import { sql } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { employees } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      const {
        user_id,
        first_name,
        last_name,
        email,
        phone,
        position,
        department_id,
        hire_date,
        salary,
        status,
        notes,
      } = req.body;

      if (!user_id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // First verify that this employee belongs to the user
      const [existingEmployee] = await db
        .select()
        .from(employees)
        .where(sql`${employees.id} = ${id} AND ${employees.user_id} = ${user_id}`);

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
          department_id,
          hire_date,
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
