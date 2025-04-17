import { NextApiRequest, NextApiResponse } from "next";

import { eq, desc } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { templates } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const user_id = req.query.user_id as string;
      if (!user_id) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const result = await db
        .select()
        .from(templates)
        .where(eq(templates.user_id, user_id))
        .orderBy(desc(templates.created_at));

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch templates" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, type, content, isDefault, user_id } = req.body;

      const result = await db.insert(templates).values({
        name,
        type,
        content: JSON.parse(content),
        isDefault,
        user_id,
      });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create template" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
