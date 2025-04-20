import { desc, eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { SalaryCreateData } from "@/modules/salary/salary.type";

import { db } from "@/db/drizzle";
import { salaries } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

// Helper to convert Drizzle salary to our Salary type
function convertDrizzleSalary(data: typeof salaries.$inferSelect) {
  return {
    id: data.id,
    created_at: data.created_at?.toString() || "",
    pay_period_start: data.pay_period_start,
    pay_period_end: data.pay_period_end,
    payment_date: data.payment_date,
    gross_amount: Number(data.gross_amount),
    net_amount: Number(data.net_amount),
    deductions: data.deductions as Record<string, number> | null,
    notes: data.notes || undefined,
    employee_name: data.employee_name,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient({
    req,
    res,
    query: {},
    resolvedUrl: "",
  });
  try {
    switch (req.method) {
      case "GET": {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.id) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const data = await db.query.salaries.findMany({
          where: eq(salaries.user_id, user?.id),
          orderBy: desc(salaries.payment_date),
        });
        return res.status(200).json(data.map(convertDrizzleSalary));
      }

      case "POST": {
        const salary = req.body as SalaryCreateData;
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.id) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        // Map salary data to match Drizzle schema
        const dbSalary = {
          pay_period_start: salary.pay_period_start,
          pay_period_end: salary.pay_period_end,
          payment_date: salary.payment_date,
          gross_amount: salary.gross_amount.toString(),
          net_amount: salary.net_amount.toString(),
          deductions: salary.deductions,
          notes: salary.notes,
          employee_name: salary.employee_name,
          user_id: user?.id,
        };

        const [data] = await db.insert(salaries).values(dbSalary).returning();
        if (!data) {
          throw new Error("Failed to create salary");
        }
        return res.status(201).json(convertDrizzleSalary(data));
      }

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("Error in salary API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
