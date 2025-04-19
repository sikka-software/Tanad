import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { branches } from "@/db/schema";
import { Branch } from "@/modules/branch/branch.type";
import { createClient } from "@/utils/supabase/server-props";

// Helper to convert Drizzle branch to our Branch type
function convertDrizzleBranch(data: typeof branches.$inferSelect): Branch {
  return {
    id: data.id,
    name: data.name,
    code: data.code,
    address: data.address,
    city: data.city,
    state: data.state,
    zip_code: data.zip_code,
    phone: data.phone,
    email: data.email,
    manager: data.manager,
    is_active: data.is_active,
    notes: data.notes,
    created_at: data.created_at?.toString() || "",
  };
}

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

  if (req.method === "GET") {
    try {
      const branch = await db.query.branches.findFirst({
        where: eq(branches.id, id as string),
      });

      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }
      // TODO: try to do it without the conver drizzle thing
      return res.status(200).json(convertDrizzleBranch(branch));
    } catch (error) {
      console.error("Error fetching branch:", error);
      return res.status(500).json({ message: "Error fetching branch" });
    }
  }

  if (req.method === "PUT") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      // Map branch data to match Drizzle schema
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

      return res.status(200).json(convertDrizzleBranch(branch));
    } catch (error) {
      console.error("Error updating branch:", error);
      return res.status(500).json({ message: "Error updating branch" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const supabase = createClient({
        req,
        res,
        query: {},
        resolvedUrl: "",
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        return res
          .status(401)
          .json({ message: "Unauthorized, you must be logged in to delete a branch" });
      }

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
