import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { expenses } from "@/db/schema";
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
    return res.status(400).json({ error: "Invalid expense ID" });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.method === "GET") {
    try {
      const expense = await db.query.expenses.findFirst({
        where: eq(expenses.id, id as string),
      });

      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      return res.status(200).json(expense);
    } catch (error) {
      console.error("Error fetching expense:", error);
      return res.status(500).json({ message: "Error fetching expense" });
    }
  }

  if (req.method === "PUT") {
    try {
      const existingExpense = await db.query.expenses.findFirst({
        where: eq(expenses.id, id as string),
      });

      if (!existingExpense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      if (existingExpense.user_id !== user.id) {
        return res.status(403).json({ error: "Not authorized to update this expense" });
      }

      const dbExpense = {
        ...req.body,
        amount: req.body.amount,
        status: req.body.status || existingExpense.status,
      };

      const [expense] = await db
        .update(expenses)
        .set(dbExpense)
        .where(eq(expenses.id, id as string))
        .returning();

      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      return res.status(200).json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      return res.status(500).json({ message: "Error updating expense" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await db.delete(expenses).where(eq(expenses.id, id as string));
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting expense:", error);
      return res.status(500).json({ message: "Error deleting expense" });
    }
  }

  return res
    .status(405)
    .json({ message: "Method not allowed, only GET, PUT and DELETE are allowed" });
}
