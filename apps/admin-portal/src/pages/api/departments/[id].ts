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
    user_id: data.user_id,
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
      // Extract locations from the request body
      const { locations, ...departmentData } = req.body;

      // Update department data if there are fields to update
      if (Object.keys(departmentData).length > 0) {
        const [updatedDepartment] = await db
          .update(departments)
          .set(departmentData)
          .where(eq(departments.id, id as string))
          .returning();

        if (!updatedDepartment) {
          return res.status(404).json({ message: "Department not found" });
        }
      }

      // Handle locations update if provided
      if (locations !== undefined) {
        // Delete removed locations
        await db
          .delete(departmentLocations)
          .where(eq(departmentLocations.department_id, id as string));

        // Insert new locations if any
        if (locations && locations.length > 0) {
          await db.insert(departmentLocations).values(
            locations.map((locationId: string) => ({
              department_id: id as string,
              locationId,
              locationType: "office", // Default to office type
            })),
          );
        }
      }

      // Fetch the updated department with its locations
      const updatedDepartment = await db.query.departments.findFirst({
        where: eq(departments.id, id as string),
        with: {
          locations: true,
        },
      });

      if (!updatedDepartment) {
        return res.status(404).json({ message: "Department not found" });
      }

      return res.status(200).json(convertDrizzleDepartment(updatedDepartment));
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
