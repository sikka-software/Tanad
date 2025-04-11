import { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { companies } from "@/db/schema";
import { Company } from "@/types/company.type";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const result = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, userId as string));

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
