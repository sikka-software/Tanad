import { NextApiRequest, NextApiResponse } from "next";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { departmentLocations, departments } from "@/db/schema";
import { Department } from "@/types/department.type";

function convertDrizzleDepartment(
  data: typeof departments.$inferSelect & {
    locations?: (typeof departmentLocations.$inferSelect)[];
  },
): Department {
  return {
    id: data.id,
    name: data.name,
    description: data.description || "",
    locations: data.locations?.map((l) => l.locationId) || [],
    createdAt: data.createdAt?.toString() || "",
    userId: data.userId,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const department = await db.query.departments.findFirst({
        where: eq(departments.id, id as string),
        with: {
          locations: true,
        },
      });

      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }

      return res.status(200).json(convertDrizzleDepartment(department));
    } catch (error) {
      console.error("Error fetching department:", error);
      return res.status(500).json({ message: "Error fetching department" });
    }
  }

  if (req.method === "PUT") {
    try {
      // Convert snake_case to camelCase if zip_code is provided
      const dbDepartment = req.body.locations
        ? {
            ...req.body,
            locations: req.body.locations,
          }
        : req.body;

      const [department] = await db
        .update(departments)
        .set(dbDepartment)
        .where(eq(departments.id, id as string))
        .returning();

      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }

      return res.status(200).json(convertDrizzleDepartment(department));
    } catch (error) {
      console.error("Error updating department:", error);
      return res.status(500).json({ message: "Error updating department" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await db.delete(departments).where(eq(departments.id, id as string));
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting department:", error);
      return res.status(500).json({ message: "Error deleting department" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
