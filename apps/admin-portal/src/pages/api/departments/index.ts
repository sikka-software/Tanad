import { eq, desc } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { Department } from "@/modules/department/department.type";

import { db } from "@/db/drizzle";
import { departmentLocations, departments } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

// Helper to convert Drizzle department to our Department type
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
      return res.status(200).json(departmentsList.map(convertDrizzleDepartment));
    } catch (error) {
      console.error("Error fetching departments:", error);
      return res.status(500).json({ message: "Error fetching departments" });
    }
  }

  if (req.method === "POST") {
    try {
      // Map client data to match Drizzle schema
      const dbDepartment = {
        ...req.body,
        locations: req.body.locations,
      };

      const [department] = await db.insert(departments).values(dbDepartment).returning();
      return res.status(201).json(convertDrizzleDepartment(department));
    } catch (error) {
      console.error("Error creating department:", error);
      return res.status(500).json({ message: "Error creating department" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
