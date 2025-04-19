import { inArray } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { employees } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

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
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid employee IDs" });
    }

    await db.delete(employees).where(inArray(employees.id, ids));
    return res.status(204).end();
  } catch (error) {
    console.error("Error bulk deleting employees:", error);
    return res.status(500).json({ message: "Error bulk deleting employees" });
  }
}
