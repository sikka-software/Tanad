import { sql } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { roles } from "@/db/schema";

type Data = {
  roles?: { name: string }[];
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // TODO: Add pagination and filtering based on enterprise context if needed

    // Fetch distinct role names from the 'roles' table
    const distinctRolesData: { name: string }[] = await db
      .selectDistinct({
        name: roles.name,
      })
      .from(roles)
      .where(sql`${roles.name} is not null`);

    return res.status(200).json({ roles: distinctRolesData });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error fetching roles",
    });
  }
}
