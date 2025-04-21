import { eq, desc } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { departmentLocations, departments } from "@/db/schema";
import { Department } from "@/modules/department/department.type";
import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient({
    req,
    res,
    query: {},
    resolvedUrl: "",
  });
  if (req.method === "GET") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const departmentsList = await db.query.departments.findMany({
        where: eq(departments.user_id, user?.id),
        orderBy: desc(departments.created_at),
        with: {
          locations: true,
        },
      });
      return res.status(200).json(departmentsList);
    } catch (error) {
      console.error("Error fetching departments:", error);
      return res.status(500).json({ message: "Error fetching departments" });
    }
  }

  if (req.method === "POST") {
    try {
      const { locations, ...departmentData } = req.body;

      // Create the department first, ensuring is_active is set
      const [department] = await db
        .insert(departments)
        .values({
          ...departmentData,
          is_active: true, // Set default value for is_active
        })
        .returning();

      // Insert locations if provided
      if (locations && locations.length > 0) {
        await db.insert(departmentLocations).values(
          locations.map((location_id: string) => ({
            department_id: department.id,
            location_id,
            location_type: "office", // Default to office type
          })),
        );
      }

      // Fetch the created department with its locations
      const createdDepartment = await db.query.departments.findFirst({
        where: eq(departments.id, department.id),
        with: {
          locations: true,
        },
      });

      if (!createdDepartment) {
        return res.status(404).json({ message: "Department not found after creation" });
      }

      return res.status(201).json(createdDepartment);
    } catch (error) {
      console.error("Error creating department:", error);
      return res.status(500).json({ message: "Error creating department" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
