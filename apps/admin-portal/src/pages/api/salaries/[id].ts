import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { salaries } from "@/db/schema";
import { Salary } from "@/modules/salary/salary.type";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing salary ID" });
  }

  if (!db) throw new Error("Database connection not initialized");

  try {
    switch (req.method) {
      case "GET": {
        const data = await db.query.salaries.findFirst({
          where: eq(salaries.id, id),
        });

        if (!data) {
          return res.status(404).json({ error: `Salary with id ${id} not found` });
        }

        return res.status(200).json(data);
      }

      case "PUT": {
        const salary = req.body as Partial<Salary>;

        // Map salary data to match Drizzle schema
        const dbSalary = {
          ...(salary.pay_period_start && { pay_period_start: salary.pay_period_start }),
          ...(salary.pay_period_end && { pay_period_end: salary.pay_period_end }),
          ...(salary.payment_date && { payment_date: salary.payment_date }),
          ...(salary.gross_amount && { gross_amount: salary.gross_amount.toString() }),
          ...(salary.net_amount && { net_amount: salary.net_amount.toString() }),
          ...(salary.deductions && { deductions: salary.deductions }),
          ...(salary.notes !== undefined && { notes: salary.notes }),
          ...(salary.employee_name && { employee_name: salary.employee_name }),
        };

        const [data] = await db
          .update(salaries)
          .set(dbSalary)
          .where(eq(salaries.id, id))
          .returning();

        if (!data) {
          return res.status(404).json({ error: `Salary with id ${id} not found` });
        }

        return res.status(200).json(data);
      }

      case "DELETE": {
        await db.delete(salaries).where(eq(salaries.id, id));
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("Error in salary API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
