import { db } from "@/db/drizzle";
import { profiles } from "@/db/schema";
import { sql } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";

// Define the shape of the data returned
interface RoleResponse {
  id: string;
  name: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RoleResponse[] | { message: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Optional: Add authorization check if needed
  // const { data: { user } } = await supabase.auth.getUser(req.cookies);
  // if (!user) return res.status(401).json({ message: 'Unauthorized' });

  console.log("API Route: Fetching distinct roles from profiles...");

  try {
    // Use Drizzle to select distinct role names from the profiles table
    const distinctRolesData: { name: string }[] = await db
      .select({
        name: sql<string>`distinct ${profiles.role}`,
      })
      .from(profiles)
      .where(sql`${profiles.role} is not null`)
      .orderBy(profiles.role);

    // Map the result to the expected RoleResponse[] format
    const roles: RoleResponse[] = distinctRolesData.map((item) => ({
      id: item.name, // Use the role name as the ID for client-side key prop
      name: item.name,
    }));

    console.log("API Route: Fetched distinct roles:", roles);
    return res.status(200).json(roles);

  } catch (error) {
    console.error("API Route: Error fetching distinct roles:", error);
    const message =
      error instanceof Error
        ? "Failed to fetch distinct roles: " + error.message
        : "An unknown error occurred while fetching distinct roles.";
    return res.status(500).json({ message });
  }
} 