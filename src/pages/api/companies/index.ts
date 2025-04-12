import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const companiesList = await db.query.companies.findMany();
    return res.status(200).json(companiesList);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return res.status(500).json({ message: "Error fetching companies" });
  }
}
