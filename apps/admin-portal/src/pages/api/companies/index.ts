import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { companies } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user_id } = req.body;
    const companiesList = await db.query.companies.findMany({
      where: eq(companies.user_id, user_id),
    });
    return res.status(200).json(companiesList);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return res.status(500).json({ message: "Error fetching companies" });
  }
}
