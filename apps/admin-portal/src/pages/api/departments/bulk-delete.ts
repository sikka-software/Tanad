import { NextApiRequest, NextApiResponse } from "next";
import { inArray } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { departmentLocations, departments } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { departmentIds } = req.body;
    console.log("Received department IDs for deletion:", departmentIds);

    if (!Array.isArray(departmentIds) || departmentIds.length === 0) {
      return res.status(400).json({ error: "Invalid department IDs" });
    }

    // Delete department locations first (due to foreign key constraints)
    await db
      .delete(departmentLocations)
      .where(inArray(departmentLocations.department_id, departmentIds));

    // Delete departments
    const deletedDepartments = await db
      .delete(departments)
      .where(inArray(departments.id, departmentIds))
      .returning();

    console.log("Departments deletion result:", deletedDepartments);

    return res.status(200).json({ message: "Departments deleted successfully" });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
} 