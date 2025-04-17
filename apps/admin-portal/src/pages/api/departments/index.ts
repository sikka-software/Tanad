import { NextApiRequest, NextApiResponse } from "next";

import { desc } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { departmentLocations, departments } from "@/db/schema";
import { Department } from "@/types/department.type";

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
    locations: data.locations?.map((l) => l.locationId) || [],
    createdAt: data.createdAt?.toString() || "",
    user_id: data.user_id,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const departmentsList = await db.query.departments.findMany({
        orderBy: desc(departments.createdAt),
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
