import { NextApiRequest, NextApiResponse } from "next";

import { desc } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { offices } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const officesList = await db.query.offices.findMany({
        orderBy: desc(offices.created_at),
      });

      return res.status(200).json(officesList);
    } catch (error) {
      console.error("Error fetching offices:", error);
      return res.status(500).json({ error: "Failed to fetch offices" });
    }
  }

  if (req.method === "POST") {
    try {
      const [office] = await db.insert(offices).values(req.body).returning();

      return res.status(201).json(office);
    } catch (error) {
      console.error("Error creating office:", error);
      return res.status(500).json({ error: "Failed to create office" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
