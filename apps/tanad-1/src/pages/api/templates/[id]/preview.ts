import { NextApiRequest, NextApiResponse } from "next";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { templates } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;

    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, id as string));

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    return res.status(200).json(template);
  } catch (error) {
    console.error("Template fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch template" });
  }
}
