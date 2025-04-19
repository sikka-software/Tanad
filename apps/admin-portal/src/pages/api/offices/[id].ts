import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { offices } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const office = await db.query.offices.findFirst({
        where: eq(offices.id, id as string),
      });

      if (!office) return res.status(404).json({ error: "Office not found" });

      return res.status(200).json(office);
    } catch (error) {
      console.error("Error fetching office:", error);
      return res.status(500).json({ error: "Failed to fetch office" });
    }
  }

  if (req.method === "PUT") {
    try {
      const [office] = await db
        .update(offices)
        .set(req.body)
        .where(eq(offices.id, id as string))
        .returning();

      if (!office) return res.status(404).json({ error: "Office not found" });

      return res.status(200).json(office);
    } catch (error) {
      console.error("Error updating office:", error);
      return res.status(500).json({ error: "Failed to update office" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await db.delete(offices).where(eq(offices.id, id as string));

      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting office:", error);
      return res.status(500).json({ error: "Failed to delete office" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
