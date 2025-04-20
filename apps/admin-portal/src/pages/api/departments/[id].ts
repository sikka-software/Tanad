import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { Department } from "@/modules/department/department.type";

import { db } from "@/db/drizzle";
import { departmentLocations, departments } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

function convertDrizzleDepartment(
  data: typeof departments.$inferSelect & {
    locations?: (typeof departmentLocations.$inferSelect)[];
  },
): Department {
  return {
    id: data.id,
    name: data.name,
    description: data.description || "",
    locations: data.locations?.map((l) => l.location_id) || [],
    created_at: data.created_at?.toString() || "",
    user_id: data.user_id,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    const supabase = createClient({
      req,
      res,
      query: {},
      resolvedUrl: "",
    });
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
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
            locations.map((location_id: string) => ({
              department_id: id as string,
              location_id,
              location_type: "office", // Default to office type
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
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid department ID" });
    }

    try {
      // Delete department locations first
      await db.delete(departmentLocations).where(eq(departmentLocations.department_id, id));

      // Delete the department
      const [deletedDepartment] = await db
        .delete(departments)
        .where(eq(departments.id, id))
        .returning();

      if (!deletedDepartment) {
        return res.status(404).json({ error: "Department not found" });
      }

      return res.status(200).json({ message: "Department deleted successfully" });
    } catch (error) {
      console.error("Error in delete:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
