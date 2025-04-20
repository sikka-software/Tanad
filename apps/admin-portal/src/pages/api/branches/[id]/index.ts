import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { branches } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const supabase = createClient({
    req,
    res,
    query: {},
    resolvedUrl: "",
  });

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid job listing ID" });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.method === "GET") {
    try {
      const branch = await db.query.branches.findFirst({
        where: eq(branches.id, id as string),
      });

      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }
      return res.status(200).json(branch);
    } catch (error) {
      console.error("Error fetching branch:", error);
      return res.status(500).json({ message: "Error fetching branch" });
    }
  }

  if (req.method === "PUT") {
    try {
      const existingBranch = await db.query.branches.findFirst({
        where: eq(branches.id, id as string),
      });

      if (!existingBranch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      if (existingBranch.user_id !== user.id) {
        return res.status(403).json({ error: "Not authorized to update this branch" });
      }

      const dbBranch = {
        ...req.body,
        zip_code: req.body.zip_code,
        is_active: req.body.is_active,
      };

      const [branch] = await db
        .update(branches)
        .set(dbBranch)
        .where(eq(branches.id, id as string))
        .returning();

      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      return res.status(200).json(branch);
    } catch (error) {
      console.error("Error updating branch:", error);
      return res.status(500).json({ message: "Error updating branch" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await db.delete(branches).where(eq(branches.id, id as string));
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting branch:", error);
      return res.status(500).json({ message: "Error deleting branch" });
    }
  }

  return res
    .status(405)
    .json({ message: "Method not allowed, only GET, PUT and DELETE are allowed" });
}
