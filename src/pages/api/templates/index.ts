import { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { templates } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const result = await db
        .select()
        .from(templates)
        .where(eq(templates.user_id, userId as string));

      return res.status(200).json(result);
    } catch (error) {
      console.error("Template fetch error:", error);
      return res.status(500).json({ 
        error: "Failed to fetch templates",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, type, content, isDefault, userId } = req.body;

      // Log request body for debugging
      console.log("Template creation request:", {
        name,
        type,
        contentType: typeof content,
        isDefault,
        userId
      });

      // Validate required fields
      if (!name || !type || !content || !userId) {
        return res.status(400).json({ 
          error: "Missing required fields",
          missing: {
            name: !name,
            type: !type,
            content: !content,
            userId: !userId
          }
        });
      }

      // Validate template type
      if (!["invoice", "quote"].includes(type)) {
        return res.status(400).json({ error: "Invalid template type" });
      }

      // Ensure content is a valid object
      let parsedContent = content;
      if (typeof content === "string") {
        try {
          parsedContent = JSON.parse(content);
        } catch (e) {
          return res.status(400).json({ 
            error: "Invalid JSON content",
            details: e instanceof Error ? e.message : String(e)
          });
        }
      }

      // If setting as default, update existing default templates
      if (isDefault) {
        await db
          .update(templates)
          .set({ isDefault: false })
          .where(eq(templates.user_id, userId));
      }

      // Create new template
      const result = await db.insert(templates).values({
        name,
        type,
        content: parsedContent,
        isDefault: isDefault || false,
        user_id: userId,
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error("Template creation error details:", error);
      return res.status(500).json({ 
        error: "Failed to create template",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
} 