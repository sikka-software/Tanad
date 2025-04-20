import { desc, eq, inArray } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { expenses } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const expensesList = await db.query.expenses.findMany({
        where: eq(expenses.user_id, user?.id),
        orderBy: desc(expenses.created_at),
      });
      return res.status(200).json(expensesList);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return res.status(500).json({ message: "Error fetching expenses" });
    }
  }

  if (req.method === "POST") {
    try {
      // Map expense data to match Drizzle schema
      const dbExpense = {
        ...req.body,
        amount: req.body.amount,
        status: req.body.status || "pending",
        user_id: user?.id,
      };

      const [expense] = await db.insert(expenses).values(dbExpense).returning();
      return res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      return res.status(500).json({ message: "Error creating expense" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      // Delete all expenses with the given IDs
      await db.delete(expenses).where(eq(expenses.id, ids[0]));

      // If there are more IDs, delete them one by one
      await db.delete(expenses).where(inArray(expenses.id, ids));

      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting expenses:", error);
      return res.status(500).json({ message: "Error deleting expenses" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
