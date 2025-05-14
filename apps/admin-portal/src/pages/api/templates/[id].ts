import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { templates } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      const { content } = req.body;

      // Validate content is valid JSON
      const parsedContent = JSON.parse(content);

      await db
        .update(templates)
        .set({ content: parsedContent })
        .where(eq(templates.id, id as string));

      return res.status(200).json({ message: "Template updated successfully" });
    } catch (error) {
      console.error("Template update error:", error);
      return res.status(500).json({ error: "Failed to update template" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
